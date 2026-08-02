import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ForumComment } from './forums/entities/forum-comment.entity';
import { ForumThread } from './forums/entities/forum-thread.entity';
import { ForumsController } from './forums/forums.controller';
import { ForumsService } from './forums/forums.service';
import { Instrument } from './instruments/entities/instrument.entity';
import { InstrumentsController } from './instruments/instruments.controller';
import { InstrumentsService } from './instruments/instruments.service';
import { RehearsalLog } from './records/entities/rehearsal-log.entity';
import { RecordsController } from './records/records.controller';
import { RecordsService } from './records/records.service';
import { Sheet } from './sheets/entities/sheet.entity';
import { SheetsController } from './sheets/sheets.controller';
import { SheetsService } from './sheets/sheets.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.resolve(process.cwd(), 'db/music-folder.sqlite'),
      entities: [Instrument, Sheet, RehearsalLog, ForumThread, ForumComment],
      synchronize: false,
      logging: false,
    }),
    TypeOrmModule.forFeature([Instrument, Sheet, RehearsalLog, ForumThread, ForumComment]),
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
