import { Body, Controller, Get, Post } from '@nestjs/common';
import { SheetsService } from './sheets.service';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Get()
  findAll() {
    return this.sheetsService.findAll();
  }

  @Post()
  create(@Body() body: { title: string; type: string; owner: string }) {
    return this.sheetsService.create(body);
  }
}
