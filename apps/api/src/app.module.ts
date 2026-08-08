import { Module } from '@nestjs/common';
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

@Module({
  imports: [AuthModule],
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
