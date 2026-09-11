import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() body: { name: string; description?: string; type?: string; visibility?: string; ownerId: string }): Promise<Group> {
    return this.groupsService.createGroup(body);
  }

  @Post('join')
  async joinByCode(@Body() body: { userId: string; code: string }): Promise<GroupMember> {
    return this.groupsService.joinGroupByCode(body.userId, body.code);
  }

  @Post(':id/regenerate-code')
  async regenerateCode(@Param('id') id: string, @Body() body: { userId: string }): Promise<Group> {
    return this.groupsService.regenerateJoinCode(id, body.userId);
  }

  @Get()
  async findAll(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get('user/:userId')
  async findUserGroups(@Param('userId') userId: string): Promise<Group[]> {
    return this.groupsService.findUserGroups(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Get(':id/members')
  async findMembers(@Param('id') id: string): Promise<GroupMember[]> {
    return this.groupsService.findMembers(id);
  }
}
