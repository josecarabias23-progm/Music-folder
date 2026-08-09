import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ForumsController } from './forums/forums.controller';
import { ForumsService } from './forums/forums.service';
import { InstrumentsController } from './instruments/instruments.controller';
import { InstrumentsService } from './instruments/instruments.service';
import { RecordsController } from './records/records.controller';
import { RecordsService } from './records/records.service';
import { SheetsController } from './sheets/sheets.controller';
import { SheetsService } from './sheets/sheets.service';

import { User } from './auth/entities/user.entity';
import { Instrument } from './instruments/entities/instrument.entity';
import { Sheet } from './sheets/entities/sheet.entity';
import { RehearsalLog } from './records/entities/rehearsal-log.entity';
import { ForumThread } from './forums/entities/forum-thread.entity';
import { ForumComment } from './forums/entities/forum-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgrespassword',
      database: process.env.POSTGRES_DB || 'music_folder',
      entities: [User, Instrument, Sheet, RehearsalLog, ForumThread, ForumComment],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Instrument, Sheet, RehearsalLog, ForumThread, ForumComment]),
    AuthModule,
  ],
  controllers: [
    AppController,
    SheetsController,
    InstrumentsController,
    RecordsController,
    ForumsController,
  ],
  providers: [
    AppService,
    SheetsService,
    InstrumentsService,
    RecordsService,
    ForumsService,
  ],
})
export class AppModule {}
