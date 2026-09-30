import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { isDirectorRole } from '../auth/roles.util';
import { Notification } from '../notifications/entities/notification.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { IUnitOfWork, UNIT_OF_WORK } from '../common/database';
import { CacheService } from '../common/cache';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly cacheService: CacheService,
  ) {}

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

    return this.unitOfWork.runInTransaction(async (uow) => {
      const userRepo = uow.getRepository(User);
      const groupRepo = uow.getRepository(Group);
      const memberRepo = uow.getRepository(GroupMember);

      const owner = await userRepo.findById(payload.ownerId);
      if (!owner) {
        throw new NotFoundException(`User ${payload.ownerId} not found`);
      }

      if (!isDirectorRole(owner.role)) {
        throw new ForbiddenException('Only director-role users can create groups');
      }

      let joinCode = this.generateJoinCode();
      let existing = await groupRepo.findOne({ where: { join_code: joinCode } as any });

      while (existing) {
        joinCode = this.generateJoinCode();
        existing = await groupRepo.findOne({ where: { join_code: joinCode } as any });
      }

      const group = groupRepo.create({
        name: payload.name.trim(),
        description: payload.description || null,
        type: payload.type || 'ensemble',
        visibility: payload.visibility || 'private',
        owner,
        join_code: joinCode,
        is_join_code_active: true,
      });

      const createdGroup = await groupRepo.save(group);

      const ownerMembership = memberRepo.create({
        group: createdGroup,
        user: owner,
        role: 'director',
        status: 'active',
      });

      await memberRepo.save(ownerMembership);

      if (this.cacheService) {
        await this.cacheService.delByPattern('group:*');
        await this.cacheService.delByPattern('user:*');
      }

      return createdGroup;
    });
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

  /**
   * Igual que `findOne`, pero exigiendo que el usuario autenticado sea miembro:
   * el grupo expone su `join_code`, así que un no-miembro podría usarlo para
   * unirse a una agrupación privada.
   */
  async findOneForMember(id: string, userId: string): Promise<Group> {
    await this.assertGroupAccess(userId, id);
    return this.findOne(id);
  }

  /** Igual que `findMembers`, pero limitado a miembros del grupo. */
  async findMembersForMember(groupId: string, userId: string): Promise<GroupMember[]> {
    await this.assertGroupAccess(userId, groupId);
    return this.findMembers(groupId);
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
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['owner'] });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const membership = await this.getMembershipForGroup(userId, groupId);

    const isOwner = group?.owner?.id === userId;
    const isUserAdmin = user?.role === 'admin';
    const isDirectorMember = membership?.role === 'director' || membership?.role === 'admin';

    if (!membership && !isOwner && !isUserAdmin) {
      throw new ForbiddenException(`User ${userId} is not a member of group ${groupId}`);
    }

    if (!isOwner && !isUserAdmin && !isDirectorMember) {
      throw new ForbiddenException(`User ${userId} must be the director of group ${groupId}`);
    }

    return membership || ({ user, group, role: isUserAdmin ? 'admin' : 'director', status: 'active' } as GroupMember);
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
    const cleanCode = code ? code.trim().toUpperCase() : '';
    if (!cleanCode) {
      throw new BadRequestException('Group join code is required');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const group = await this.groupRepository.findOne({
      where: { join_code: cleanCode, is_join_code_active: true },
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

    if (this.cacheService) {
      await this.cacheService.delByPattern('group:*');
      await this.cacheService.delByPattern('user:*');
    }

    return savedMember;
  }
}
