import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, PayloadTooLargeException, Res, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiParam, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { SheetsService } from './sheets.service';
import { StorageService } from '../storage/storage.service';
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_LABEL } from '../storage/storage.interface';
import { Roles } from '../auth/roles.decorator';

@Controller('sheets')
@ApiTags('Sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService, private readonly storageService: StorageService) {}

  @Get()
  @ApiOperation({ summary: 'Listar partituras', description: 'Datos temporales en memoria hasta incorporar SQLite.' })
  findAll() {
    return this.sheetsService.findAll();
  }

  @Post()
  @Roles('admin', 'director')
  @ApiOperation({ summary: 'Crear una partitura (sólo dirección/administración)' })
  @ApiBody({ schema: { example: { title: 'Sinfonía en Do', type: 'pdf', owner: 'Orquesta Nacional' } } })
  create(@Body() body: { title: string; type: string; owner: string }) {
    return this.sheetsService.create(body);
  }

  @Post(':id/upload')
  @Roles('admin', 'director')
  @UseInterceptors(
    FileInterceptor('file', {
      // Límite duro de 20 MB: multer aborta con 413 antes de cargar el archivo
      // completo en memoria.
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivo PDF para una partitura' })
  async uploadFile(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    // Only accept PDF for now
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Sólo se permiten archivos PDF');
    }

    // Defensa extra por si el límite del interceptor no llegara a aplicarse.
    if (typeof file.size === 'number' && file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `El archivo supera el límite de ${MAX_UPLOAD_SIZE_LABEL}`,
      );
    }

    const saved = await this.storageService.saveFile(file, `sheet-${id}`);

    const updated = await this.sheetsService.attachFile(id, saved.reference, saved.size, saved.format);
    return updated;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar el archivo PDF de una partitura' })
  async download(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const reference = await this.sheetsService.getStoredReference(id);
    if (!reference) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // El adaptador de almacenamiento decide cómo entregarlo: stream (disco local)
    // o redirección (URL externa o URL prefirmada de S3/R2). El controlador ya no
    // toca el filesystem, por lo que la descarga funciona con cualquier backend.
    const target = await this.storageService.resolveDownload(reference);
    if (!target) {
      return res.status(404).json({ message: 'Archivo físico no encontrado' });
    }

    const inline = req.query && (req.query.inline === '1' || req.query.inline === 'true');
    const disposition = `${inline ? 'inline' : 'attachment'}; filename="${id}.pdf"`;

    if (target.kind === 'redirect') {
      return res.redirect(target.url);
    }

    res.setHeader('Content-Type', target.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    if (target.size) {
      res.setHeader('Content-Length', String(target.size));
    }

    target.stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'No se pudo leer el archivo almacenado' });
      } else {
        res.end();
      }
    });

    target.stream.pipe(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una partitura por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: string) { return this.sheetsService.findOne(id); }

  @Patch(':id')
  @Roles('admin', 'director')
  @ApiOperation({ summary: 'Actualizar los metadatos de una partitura (sólo dirección/administración)' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; type: string; owner: string }>) { return this.sheetsService.update(id, body); }

  @Delete(':id')
  @Roles('admin', 'director')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una partitura (sólo dirección/administración)' })
  remove(@Param('id') id: string) { return this.sheetsService.remove(id); }
}
