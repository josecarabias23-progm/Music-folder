import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupLibraryItem } from './entities/group-library-item.entity';
import { GroupRehearsal } from './entities/group-rehearsal.entity';
import { GroupCommunityPost } from './group-community.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupLibraryController } from './group-library.controller';
import { GroupLibraryService } from './group-library.service';
import { GroupRehearsalController } from './group-rehearsal.controller';
import { GroupRehearsalService } from './group-rehearsal.service';
import { GroupCommunityController } from './group-community.controller';
import { GroupCommunityService } from './group-community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, User, GroupLibraryItem, GroupRehearsal, GroupCommunityPost, Notification])],
  controllers: [GroupsController, GroupLibraryController, GroupRehearsalController, GroupCommunityController],
  providers: [GroupsService, GroupLibraryService, GroupRehearsalService, GroupCommunityService],
  exports: [GroupsService, GroupLibraryService, GroupRehearsalService, GroupCommunityService],
})
export class GroupsModule {}
