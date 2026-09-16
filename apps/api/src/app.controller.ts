import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
@ApiTags('System')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Público a propósito: es el endpoint de health check de Render
   * (`healthCheckPath: /api/v1/health`), que no envía credenciales.
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Verificar el estado de la API' })
  getHealth() {
    return this.appService.getHealth();
  }
}
