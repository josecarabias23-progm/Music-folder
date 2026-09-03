import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Res, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiParam, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { SheetsService } from './sheets.service';
import { LocalStorageService } from '../storage/storage.service';

@Controller('sheets')
@ApiTags('Sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService, private readonly storageService: LocalStorageService) {}

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

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivo PDF para una partitura' })
  async uploadFile(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    // Only accept PDF for now
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Sólo se permiten archivos PDF');
    }

    const saved = await this.storageService.saveFile(file, `sheet-${id}`);

    const updated = await this.sheetsService.attachFile(id, saved.path, saved.size, saved.format);
    return updated;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar el archivo PDF de una partitura' })
  async download(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const filePath = await this.sheetsService.getFilePath(id);
    if (!filePath) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // Stream the file
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo físico no encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    const inline = req.query && (req.query.inline === '1' || req.query.inline === 'true');
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${id}.pdf"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
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
