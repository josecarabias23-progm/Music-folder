import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ForumsController } from './forums/forums.controller';
import { ForumsService } from './forums/forums.service';
import { InstrumentsController } from './instruments/instruments.controller';
import { InstrumentsService } from './instruments/instruments.service';
import { InstrumentsSeedService } from './instruments/seed.service';
import { RecordsController } from './records/records.controller';
import { RecordsService } from './records/records.service';
import { SheetsController } from './sheets/sheets.controller';
import { PublicScoresController } from './public-scores/public-scores.controller';
import { SheetsService } from './sheets/sheets.service';
import { PublicScoresService } from './public-scores/public-scores.service';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GroupsModule } from './groups/groups.module';
import { buildDataSourceOptions, resolveSynchronize } from './config/database.config';

import { User } from './auth/entities/user.entity';
import { Instrument } from './instruments/entities/instrument.entity';
import { Sheet } from './sheets/entities/sheet.entity';
import { RehearsalLog } from './records/entities/rehearsal-log.entity';
import { ForumThread } from './forums/entities/forum-thread.entity';
import { ForumComment } from './forums/entities/forum-comment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Group } from './groups/entities/group.entity';
import { GroupMember } from './groups/entities/group-member.entity';
import { GroupLibraryItem } from './groups/entities/group-library-item.entity';
import { GroupRehearsal } from './groups/entities/group-rehearsal.entity';
import { GroupCommunityPost } from './groups/group-community.entity';

// Conexión y esquema: estas funciones son las MISMAS que usa el CLI de migraciones
// (src/config/typeorm.datasource.ts), de modo que la aplicación y las migraciones
// no puedan desincronizarse.
const synchronize = resolveSynchronize();
const isProduction = process.env.NODE_ENV === 'production';

if (synchronize && isProduction) {
  new Logger('TypeOrmConfig').warn(
    'synchronize=true en producción: TypeORM alterará el esquema en cada arranque. Las migraciones se aplican en preDeployCommand; definí DB_SYNCHRONIZE=false.',
  );
}

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(),
      // El esquema se gestiona con migraciones (ver preDeployCommand en render.yaml).
      // `DB_SYNCHRONIZE=true` sólo debería usarse en entornos de desarrollo.
      synchronize,
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Instrument, Sheet, RehearsalLog, ForumThread, ForumComment, Notification, Group, GroupMember, GroupLibraryItem, GroupRehearsal, GroupCommunityPost]),
    AuthModule,
    NotificationsModule,
    GroupsModule,
    StorageModule,
  ],
  controllers: [
    AppController,
    SheetsController,
    PublicScoresController,
    InstrumentsController,
    RecordsController,
    ForumsController,
  ],
  providers: [
    AppService,
    SheetsService,
    PublicScoresService,
    InstrumentsService,
    InstrumentsSeedService,
    RecordsService,
    ForumsService,
  ],
})
export class AppModule {}

