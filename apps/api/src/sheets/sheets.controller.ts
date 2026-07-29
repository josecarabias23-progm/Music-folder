import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SheetsService } from './sheets.service';

@Controller('sheets')
@ApiTags('Sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar partituras', description: 'Datos temporales en memoria hasta incorporar SQLite.' })
  findAll() {
    return this.sheetsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear una partitura temporal' })
  @ApiBody({ schema: { example: { title: 'Sinfonía en Do', type: 'pdf', owner: 'Orquesta Nacional' } } })
  create(@Body() body: { title: string; type: string; owner: string }) {
    return this.sheetsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una partitura por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: string) { return this.sheetsService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los metadatos de una partitura temporal' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; type: string; owner: string }>) { return this.sheetsService.update(id, body); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una partitura temporal' })
  remove(@Param('id') id: string) { return this.sheetsService.remove(id); }
}
