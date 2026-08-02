import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InstrumentsService } from './instruments.service';

@Controller('instruments')
@ApiTags('Instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar instrumentos' })
  findAll() {
    return this.instrumentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un instrumento por id' })
  @ApiParam({ name: 'id', example: 'violin' })
  findOne(@Param('id') id: string) { return this.instrumentsService.findOne(id); }
}
