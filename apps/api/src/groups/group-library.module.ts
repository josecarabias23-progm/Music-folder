import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupLibraryItem } from './entities/group-library-item.entity';
import { GroupLibraryController } from './group-library.controller';
import { GroupLibraryService } from './group-library.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupLibraryItem, User])],
  controllers: [GroupLibraryController],
  providers: [GroupLibraryService],
  exports: [GroupLibraryService],
})
export class GroupLibraryModule {}
