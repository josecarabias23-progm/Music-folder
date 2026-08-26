import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RecordsService } from './records.service';

@Controller('records')
@ApiTags('Records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de ensayo' })
  findAll() {
    return this.recordsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un registro de ensayo de prueba' })
  @ApiBody({ schema: { example: { title: 'Ensayo general', artist: 'Orquesta Municipal', date: '2026-07-28' } } })
  create(@Body() body: { title: string; artist: string; date: string }) {
    return this.recordsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de ensayo por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: string) { return this.recordsService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de ensayo temporal' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; artist: string; date: string }>) { return this.recordsService.update(id, body); }

  @Post(':id/attendance')
  @ApiOperation({ summary: 'Registrar asistencia de un músico y notificar' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiBody({ schema: { example: { userId: 'usr-1', userName: 'Sofía Martínez', status: 'presente' } } })
  recordAttendance(
    @Param('id') id: string,
    @Body() body: { userId: string; userName: string; status: 'presente' | 'ausente' | 'justificado' },
  ) {
    return this.recordsService.recordAttendance(id, body.userId, body.userName, body.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un registro de ensayo temporal' })
  remove(@Param('id') id: string) { return this.recordsService.remove(id); }
}
