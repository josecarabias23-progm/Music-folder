import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupCommunityPost } from './group-community.entity';
import { GroupsService } from './groups.service';

@Injectable()
export class GroupCommunityService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupCommunityPost)
    private readonly postRepository: Repository<GroupCommunityPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly groupsService: GroupsService,
  ) {}

  async createPost(groupId: string, payload: { title: string; content: string; authorId: string; visibility?: string }): Promise<GroupCommunityPost> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!payload.authorId) throw new ForbiddenException('User is required to post in the group');
    await this.groupsService.assertGroupAccess(payload.authorId, groupId);

    if (!payload.title || !payload.title.trim()) {
      throw new BadRequestException('Title is required');
    }

    if (!payload.content || !payload.content.trim()) {
      throw new BadRequestException('Content is required');
    }

    const author = await this.userRepository.findOne({ where: { id: payload.authorId } });
    if (!author) throw new NotFoundException(`User ${payload.authorId} not found`);

    const post = this.postRepository.create({
      group,
      author,
      title: payload.title.trim(),
      content: payload.content.trim(),
      visibility: payload.visibility || 'group',
    });

    return this.postRepository.save(post);
  }

  async listPosts(groupId: string, actingUserId: string): Promise<GroupCommunityPost[]> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    if (!actingUserId) {
      throw new ForbiddenException('User is required to view the group community');
    }

    await this.groupsService.assertGroupAccess(actingUserId, groupId);

    return this.postRepository.find({
      where: { group: { id: groupId } },
      relations: ['group', 'author'],
      order: { created_at: 'DESC' },
    });
  }
}
