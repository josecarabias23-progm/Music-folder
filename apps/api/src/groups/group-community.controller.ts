import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupCommunityService } from './group-community.service';
import { GroupCommunityPost } from './group-community.entity';

@Controller('groups')
export class GroupCommunityController {
  constructor(private readonly groupCommunityService: GroupCommunityService) {}

  @Post(':groupId/community')
  async createPost(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; content: string; authorId: string; visibility?: string },
  ): Promise<GroupCommunityPost> {
    return this.groupCommunityService.createPost(groupId, body);
  }

  @Get(':groupId/community/:userId')
  async listPosts(@Param('groupId') groupId: string, @Param('userId') userId: string): Promise<GroupCommunityPost[]> {
    return this.groupCommunityService.listPosts(groupId, userId);
  }
}
