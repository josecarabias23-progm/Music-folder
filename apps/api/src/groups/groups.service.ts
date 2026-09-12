import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  private isDirectorRole(role?: string | null): boolean {
    const normalized = (role ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    if (!normalized) return false;

    return ['director', 'conductor', 'gestor', 'coordinador', 'administrador', 'jefe de cuerda'].some((token) => normalized.includes(token));
  }

  private generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  async createGroup(payload: {
    name: string;
    description?: string;
    type?: string;
    visibility?: string;
    ownerId: string;
  }): Promise<Group> {
    if (!payload.name || !payload.name.trim()) {
      throw new BadRequestException('Group name is required');
    }

    const owner = await this.userRepository.findOne({ where: { id: payload.ownerId } });
    if (!owner) {
      throw new NotFoundException(`User ${payload.ownerId} not found`);
    }

    if (!this.isDirectorRole(owner.role)) {
      throw new ForbiddenException('Only director-role users can create groups');
    }

    let joinCode = this.generateJoinCode();
    let existing = await this.groupRepository.findOne({ where: { join_code: joinCode } });

    while (existing) {
      joinCode = this.generateJoinCode();
      existing = await this.groupRepository.findOne({ where: { join_code: joinCode } });
    }

    const group = this.groupRepository.create({
      name: payload.name.trim(),
      description: payload.description || null,
      type: payload.type || 'ensemble',
      visibility: payload.visibility || 'private',
      owner,
      join_code: joinCode,
      is_join_code_active: true,
    });

    const createdGroup = await this.groupRepository.save(group);

    const ownerMembership = this.groupMemberRepository.create({
      group: createdGroup,
      user: owner,
      role: 'director',
      status: 'active',
    });

    await this.groupMemberRepository.save(ownerMembership);
    return createdGroup;
  }

  async findAll(userId?: string): Promise<Group[]> {
    if (!userId) {
      return [];
    }

    return this.findUserGroups(userId);
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException(`Group ${id} not found`);
    }

    return group;
  }

  async findMembers(groupId: string): Promise<GroupMember[]> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    return this.groupMemberRepository.find({
      where: { group: { id: groupId } },
      relations: ['user', 'group'],
      order: { joined_at: 'DESC' },
    });
  }

  async findUserGroups(userId: string): Promise<Group[]> {
    const memberships = await this.groupMemberRepository.find({
      where: { user: { id: userId }, status: 'active' },
      relations: ['group', 'group.owner'],
      order: { joined_at: 'DESC' },
    });

    return memberships.map((membership) => membership.group);
  }

  async getMembershipForGroup(userId: string, groupId: string): Promise<GroupMember | null> {
    return this.groupMemberRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId }, status: 'active' },
      relations: ['user', 'group'],
    });
  }

  async assertGroupAccess(userId: string, groupId: string): Promise<GroupMember> {
    const membership = await this.getMembershipForGroup(userId, groupId);
    if (!membership) {
      throw new ForbiddenException(`User ${userId} is not a member of group ${groupId}`);
    }

    return membership;
  }

  async assertDirectorAccess(userId: string, groupId: string): Promise<GroupMember> {
    const membership = await this.assertGroupAccess(userId, groupId);
    if (membership.role !== 'director') {
      throw new ForbiddenException(`User ${userId} must be the director of group ${groupId}`);
    }

    return membership;
  }

  async regenerateJoinCode(groupId: string, actorUserId: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['owner'] });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    await this.assertDirectorAccess(actorUserId, groupId);

    let nextCode = this.generateJoinCode();
    let existing = await this.groupRepository.findOne({ where: { join_code: nextCode } });

    while (existing && existing.id !== groupId) {
      nextCode = this.generateJoinCode();
      existing = await this.groupRepository.findOne({ where: { join_code: nextCode } });
    }

    group.join_code = nextCode;
    group.is_join_code_active = true;
    return this.groupRepository.save(group);
  }

  async joinGroupByCode(userId: string, code: string): Promise<GroupMember> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const group = await this.groupRepository.findOne({
      where: { join_code: code, is_join_code_active: true },
      relations: ['owner'],
    });

    if (!group) {
      throw new BadRequestException('Invalid or inactive group code');
    }

    const existingMember = await this.groupMemberRepository.findOne({
      where: {
        group: { id: group.id },
        user: { id: user.id },
      },
      relations: ['group', 'user'],
    });

    if (existingMember) {
      return existingMember;
    }

    const member = this.groupMemberRepository.create({
      group,
      user,
      role: 'student',
      status: 'active',
    });

    const savedMember = await this.groupMemberRepository.save(member);

    if (group.owner?.id) {
      const studentName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: group.owner.id,
          type: 'student_joined',
          title: 'Nuevo alumno en tu grupo',
          message: `${studentName} se unió a ${group.name}.`,
          targetId: group.id,
          metadata: {
            groupId: group.id,
            groupName: group.name,
            studentId: user.id,
            studentName,
          },
        }),
      );
    }

    return savedMember;
  }
}
