import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupRehearsalService } from './group-rehearsal.service';
import { GroupRehearsal } from './entities/group-rehearsal.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('groups')
export class GroupRehearsalController {
  constructor(private readonly groupRehearsalService: GroupRehearsalService) {}

  @Post(':groupId/rehearsals')
  async createRehearsal(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; date?: string; time?: string; location?: string; agenda?: string; notes?: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupRehearsal> {
    // `created_by` se deriva del token: antes, enviarlo en el body permitía
    // programar ensayos atribuyéndolos a otro director.
    return this.groupRehearsalService.createRehearsal(groupId, { ...body, created_by: user.id });
  }

  /** El `:userId` del path se eliminó: la autorización usa el usuario del token. */
  @Get(':groupId/rehearsals')
  async listRehearsals(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupRehearsal[]> {
    return this.groupRehearsalService.listRehearsals(groupId, user.id);
  }
}
