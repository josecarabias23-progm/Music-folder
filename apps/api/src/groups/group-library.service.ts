import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupLibraryItem } from './entities/group-library-item.entity';
import { GroupsService } from './groups.service';

@Injectable()
export class GroupLibraryService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupLibraryItem)
    private readonly libraryRepository: Repository<GroupLibraryItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly groupsService: GroupsService,
  ) {}

  async addItem(
    groupId: string,
    actingUserId: string,
    payload: { title: string; description?: string; type?: string; file_url?: string; uploaded_by?: string },
  ): Promise<GroupLibraryItem> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!actingUserId) throw new ForbiddenException('User is required to add a library item');
    await this.groupsService.assertDirectorAccess(actingUserId, groupId);

    if (!payload.title || !payload.title.trim()) {
      throw new BadRequestException('Title is required');
    }

    const uploader = payload.uploaded_by ? await this.userRepository.findOne({ where: { id: payload.uploaded_by } }) : null;

    const item = this.libraryRepository.create({
      group,
      title: payload.title.trim(),
      description: payload.description || null,
      type: payload.type || 'score',
      file_url: payload.file_url || null,
      uploaded_by: uploader,
    });

    return this.libraryRepository.save(item);
  }

  async listItems(groupId: string, actingUserId: string): Promise<GroupLibraryItem[]> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!actingUserId) {
      throw new ForbiddenException('User is required to view the group library');
    }

    await this.groupsService.assertGroupAccess(actingUserId, groupId);

    return this.libraryRepository.find({
      where: { group: { id: groupId } },
      relations: ['group', 'uploaded_by'],
      order: { created_at: 'DESC' },
    });
  }
}
