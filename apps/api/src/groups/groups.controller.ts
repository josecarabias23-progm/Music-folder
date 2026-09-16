import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @Body() body: { name: string; description?: string; type?: string; visibility?: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Group> {
    // El propietario es SIEMPRE el usuario del token: antes se aceptaba
    // `ownerId` del body, lo que permitía crear grupos a nombre de otro director.
    return this.groupsService.createGroup({ ...body, ownerId: user.id });
  }

  @Post('join')
  async joinByCode(
    @Body() body: { code: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupMember> {
    return this.groupsService.joinGroupByCode(user.id, body.code);
  }

  @Post(':id/regenerate-code')
  async regenerateCode(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Group> {
    // El actor sale del token: antes `userId` viajaba en el body y permitía
    // rotar el código de invitación de un grupo ajeno.
    return this.groupsService.regenerateJoinCode(id, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<Group[]> {
    return this.groupsService.findAll(user.id);
  }

  /**
   * Grupos del usuario autenticado. Reemplaza a `/groups/user/:userId`, que
   * permitía listar los grupos de cualquier usuario.
   */
  @Get('mine')
  async findUserGroups(@CurrentUser() user: AuthenticatedUser): Promise<Group[]> {
    return this.groupsService.findUserGroups(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Group> {
    return this.groupsService.findOneForMember(id, user.id);
  }

  @Get(':id/members')
  async findMembers(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupMember[]> {
    return this.groupsService.findMembersForMember(id, user.id);
  }
}
