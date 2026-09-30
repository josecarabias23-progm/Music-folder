import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RehearsalLog } from './entities/rehearsal-log.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { GroupsService } from '../groups/groups.service';
import { AttendanceMarkedEvent } from '../notifications/events/attendance-marked.event';

export interface RehearsalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  attendeesCount?: number;
  notes?: string;
  groupId?: string;
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RehearsalLog)
    private readonly logRepository: Repository<RehearsalLog>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly groupsService: GroupsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private mapEntityToRecord(log: RehearsalLog): RehearsalRecord {
    return {
      id: log.id,
      title: log.title,
      type: log.type || 'General',
      date: log.date_text || '',
      time: log.time_text || '',
      venue: log.venue || '',
      attendeesCount: log.attendees_count ?? 0,
      notes: log.notes || '',
      groupId: log.group_id || undefined,
    };
  }

  async findAll(userId?: string): Promise<RehearsalRecord[]> {
    if (!userId) {
      return [];
    }

    const memberships = await this.groupMemberRepository.find({
      where: { user: { id: userId }, status: 'active' },
      relations: ['group'],
    });

    const activeGroupIds = memberships.map((m) => m.group?.id).filter((id): id is string => Boolean(id));

    if (activeGroupIds.length === 0) {
      return [];
    }

    const logs = await this.logRepository.find({
      where: { group_id: In(activeGroupIds) },
      order: { created_at: 'DESC' },
    });

    return logs.map((l) => this.mapEntityToRecord(l));
  }

  async create(payload: Partial<RehearsalRecord> & { groupId?: string }, creatorUserId?: string): Promise<RehearsalRecord> {
    if (!creatorUserId) {
      throw new BadRequestException('Creator user id is required to create a record');
    }

    let targetGroupId = payload.groupId;
    if (!targetGroupId) {
      const activeMemberships = await this.groupMemberRepository.find({
        where: { user: { id: creatorUserId }, status: 'active' },
        relations: ['group'],
      });
      if (activeMemberships.length > 0 && activeMemberships[0].group?.id) {
        targetGroupId = activeMemberships[0].group.id;
      } else {
        throw new BadRequestException('El ensayo debe estar vinculado a un grupo válido');
      }
    }

    await this.groupsService.assertDirectorAccess(creatorUserId, targetGroupId);

    const log = this.logRepository.create({
      title: payload.title || 'Nuevo ensayo',
      type: payload.type || 'General',
      date_text: payload.date || 'Próxima fecha',
      time_text: payload.time || '19:00 - 21:00',
      venue: payload.venue || 'Sala Principal',
      attendees_count: payload.attendeesCount || 0,
      notes: payload.notes || '',
      group_id: targetGroupId,
    });
    const saved = await this.logRepository.save(log);
    const record = this.mapEntityToRecord(saved);

    const activeMembers = await this.groupMemberRepository.find({
      where: { group: { id: targetGroupId }, status: 'active' },
      relations: ['user'],
    });

    for (const member of activeMembers) {
      if (member.user?.id) {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            userId: member.user.id,
            type: 'rehearsal_scheduled',
            title: `🗓️ Ensayo: ${record.title}`,
            message: `${record.date || 'Próxima fecha'} · ${record.venue || 'Sala Principal'}`,
            targetId: record.id,
            metadata: {
              date: `${record.date} · ${record.time}`,
              venue: record.venue,
              groupId: targetGroupId,
            },
          }),
        );
      }
    }

    return record;
  }

  async recordAttendance(
    id: string,
    userId: string,
    userName: string,
    status: 'presente' | 'ausente' | 'justificado',
  ) {
    const record = await this.findOne(id);
    this.eventEmitter.emit(
      'attendance.marked',
      new AttendanceMarkedEvent(
        record.id,
        record.title,
        userId,
        userName,
        status,
        record.date,
      ),
    );
    return { success: true, status, rehearsal: record.title };
  }

  async findOne(id: string): Promise<RehearsalRecord> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Record ${id} not found`);
    return this.mapEntityToRecord(log);
  }

  async update(id: string, payload: Partial<RehearsalRecord>): Promise<RehearsalRecord> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Record ${id} not found`);

    if (payload.title) log.title = payload.title;
    if (payload.type) log.type = payload.type;
    if (payload.date) log.date_text = payload.date;
    if (payload.time) log.time_text = payload.time;
    if (payload.venue) log.venue = payload.venue;
    if (payload.attendeesCount !== undefined) log.attendees_count = payload.attendeesCount;
    if (payload.notes !== undefined) log.notes = payload.notes;

    const saved = await this.logRepository.save(log);
    return this.mapEntityToRecord(saved);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.logRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Record ${id} not found`);
    return { success: true };
  }
}

