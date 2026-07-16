import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SheetsController } from './sheets/sheets.controller';
import { RecordsController } from './records/records.controller';
import { InstrumentsController } from './instruments/instruments.controller';
import { ForumsController } from './forums/forums.controller';
import { SheetsService } from './sheets/sheets.service';
import { RecordsService } from './records/records.service';
import { InstrumentsService } from './instruments/instruments.service';
import { ForumsService } from './forums/forums.service';

@Module({
  imports: [],
  controllers: [AppController, SheetsController, RecordsController, InstrumentsController, ForumsController],
  providers: [AppService, SheetsService, RecordsService, InstrumentsService, ForumsService],
})
export class AppModule {}
