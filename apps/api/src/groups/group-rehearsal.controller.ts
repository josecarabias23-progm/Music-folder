import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupRehearsalService } from './group-rehearsal.service';
import { GroupRehearsal } from './entities/group-rehearsal.entity';

@Controller('groups')
export class GroupRehearsalController {
  constructor(private readonly groupRehearsalService: GroupRehearsalService) {}

  @Post(':groupId/rehearsals')
  async createRehearsal(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; date?: string; time?: string; location?: string; agenda?: string; notes?: string; created_by?: string },
  ): Promise<GroupRehearsal> {
    return this.groupRehearsalService.createRehearsal(groupId, body);
  }

  @Get(':groupId/rehearsals/:userId')
  async listRehearsals(@Param('groupId') groupId: string, @Param('userId') userId: string): Promise<GroupRehearsal[]> {
    return this.groupRehearsalService.listRehearsals(groupId, userId);
  }
}
