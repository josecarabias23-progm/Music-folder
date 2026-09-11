import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupLibraryService } from './group-library.service';
import { GroupLibraryItem } from './entities/group-library-item.entity';

@Controller('groups')
export class GroupLibraryController {
  constructor(private readonly groupLibraryService: GroupLibraryService) {}

  @Post(':groupId/library')
  async addItem(
    @Param('groupId') groupId: string,
    @Body() body: { userId: string; title: string; description?: string; type?: string; file_url?: string; uploaded_by?: string },
  ): Promise<GroupLibraryItem> {
    return this.groupLibraryService.addItem(groupId, body.userId, { title: body.title, description: body.description, type: body.type, file_url: body.file_url, uploaded_by: body.uploaded_by || body.userId });
  }

  @Get(':groupId/library/:userId')
  async listItems(@Param('groupId') groupId: string, @Param('userId') userId: string): Promise<GroupLibraryItem[]> {
    return this.groupLibraryService.listItems(groupId, userId);
  }
}
