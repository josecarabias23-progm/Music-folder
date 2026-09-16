import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupCommunityService } from './group-community.service';
import { GroupCommunityPost } from './group-community.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('groups')
export class GroupCommunityController {
  constructor(private readonly groupCommunityService: GroupCommunityService) {}

  @Post(':groupId/community')
  async createPost(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; content: string; visibility?: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupCommunityPost> {
    // El autor es el usuario del token: antes `authorId` llegaba en el body y
    // permitía publicar en nombre de otro miembro.
    return this.groupCommunityService.createPost(groupId, { ...body, authorId: user.id });
  }

  /** El `:userId` del path se eliminó: la autorización usa el usuario del token. */
  @Get(':groupId/community')
  async listPosts(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupCommunityPost[]> {
    return this.groupCommunityService.listPosts(groupId, user.id);
  }
}
