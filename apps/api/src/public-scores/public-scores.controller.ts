import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicScoresService } from './public-scores.service';

@Controller('public-scores')
@ApiTags('Public Scores')
export class PublicScoresController {
  constructor(private readonly service: PublicScoresService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar partituras de dominio público (IMSLP - scraping ligero)' })
  async search(@Query('q') q: string) {
    return await this.service.searchIMSLP(q || '');
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar una partitura pública a la biblioteca' })
  async import(@Body() body: { title: string; composer?: string; pdfUrl?: string; sourceUrl?: string; instrumentation?: string }) {
    return await this.service.importPublicScore(body);
  }
}
