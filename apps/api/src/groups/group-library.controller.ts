import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupLibraryService } from './group-library.service';
import { GroupLibraryItem } from './entities/group-library-item.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('groups')
export class GroupLibraryController {
  constructor(private readonly groupLibraryService: GroupLibraryService) {}

  @Post(':groupId/library')
  async addItem(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; description?: string; type?: string; file_url?: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupLibraryItem> {
    // El actor y el autor de la carga los fija el servidor desde el token.
    return this.groupLibraryService.addItem(groupId, user.id, {
      title: body.title,
      description: body.description,
      type: body.type,
      file_url: body.file_url,
      uploaded_by: user.id,
    });
  }

  /** El `:userId` del path se eliminó: la autorización usa el usuario del token. */
  @Get(':groupId/library')
  async listItems(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GroupLibraryItem[]> {
    return this.groupLibraryService.listItems(groupId, user.id);
  }
}
