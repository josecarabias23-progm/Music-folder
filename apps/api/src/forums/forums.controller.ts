import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ForumsService } from './forums.service';

@Controller('forums')
@ApiTags('Forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get('threads')
  @ApiOperation({ summary: 'Listar hilos del foro' })
  findAll() {
    return this.forumsService.findAll();
  }

  @Post('threads')
  @ApiOperation({ summary: 'Crear un hilo de foro de prueba' })
  @ApiBody({ schema: { example: { title: 'Cómo preparar una audición' } } })
  create(@Body() body: { title: string }) {
    return this.forumsService.create(body);
  }

  @Get('threads/:id')
  @ApiOperation({ summary: 'Obtener un hilo de foro por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: string) { return this.forumsService.findOne(id); }
}
