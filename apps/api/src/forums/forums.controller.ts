import { Body, Controller, Get, Post } from '@nestjs/common';
import { ForumsService } from './forums.service';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get('threads')
  findAll() {
    return this.forumsService.findAll();
  }

  @Post('threads')
  create(@Body() body: { title: string }) {
    return this.forumsService.create(body);
  }
}
