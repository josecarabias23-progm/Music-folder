import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupRehearsal } from './entities/group-rehearsal.entity';
import { GroupMember } from './entities/group-member.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { GroupsService } from './groups.service';

@Injectable()
export class GroupRehearsalService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupRehearsal)
    private readonly rehearsalRepository: Repository<GroupRehearsal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly groupsService: GroupsService,
  ) {}

  async createRehearsal(groupId: string, payload: { title: string; date?: string; time?: string; location?: string; agenda?: string; notes?: string; created_by?: string }): Promise<GroupRehearsal> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!payload.created_by) throw new ForbiddenException('Director is required to schedule a rehearsal');
    await this.groupsService.assertDirectorAccess(payload.created_by, groupId);

    if (!payload.title || !payload.title.trim()) {
      throw new BadRequestException('Rehearsal title is required');
    }

    const creator = await this.userRepository.findOne({ where: { id: payload.created_by } });
    if (!creator) throw new NotFoundException(`User ${payload.created_by} not found`);

    const rehearsal = this.rehearsalRepository.create({
      group,
      title: payload.title.trim(),
      date: payload.date || null,
      time: payload.time || null,
      location: payload.location || null,
      agenda: payload.agenda || null,
      notes: payload.notes || null,
      created_by: creator,
    });

    const savedRehearsal = await this.rehearsalRepository.save(rehearsal);

    const activeMembers = await this.groupMemberRepository.find({
      where: { group: { id: groupId }, status: 'active' },
      relations: ['user'],
    });

    for (const member of activeMembers) {
      if (member.user?.id) {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            userId: member.user.id,
            type: 'rehearsal_scheduled',
            title: `🗓️ Ensayo en ${group.name}`,
            message: `${savedRehearsal.title}: ${savedRehearsal.date || 'Próxima fecha'} · ${savedRehearsal.location || 'Sala Principal'}`,
            targetId: savedRehearsal.id,
            metadata: {
              groupId,
              groupName: group.name,
              date: `${savedRehearsal.date} · ${savedRehearsal.time}`,
              location: savedRehearsal.location,
            },
          }),
        );
      }
    }

    return savedRehearsal;
  }

  async listRehearsals(groupId: string, actingUserId: string): Promise<GroupRehearsal[]> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!actingUserId) {
      throw new ForbiddenException('User is required to view the group rehearsals');
    }

    await this.groupsService.assertGroupAccess(actingUserId, groupId);

    return this.rehearsalRepository.find({
      where: { group: { id: groupId } },
      relations: ['group', 'created_by'],
      order: { created_at: 'DESC' },
    });
  }
}
