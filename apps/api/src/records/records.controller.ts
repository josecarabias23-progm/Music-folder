import { Body, Controller, Get, Post } from '@nestjs/common';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  findAll() {
    return this.recordsService.findAll();
  }

  @Post()
  create(@Body() body: { title: string; artist: string; date: string }) {
    return this.recordsService.create(body);
  }
}
