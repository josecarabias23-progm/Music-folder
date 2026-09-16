import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Formato estándar de error de la API.
 * `message` puede ser un string o la lista de errores de validación.
 */
export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

/**
 * Filtro global de excepciones.
 *
 * - HttpException: respeta el status y el mensaje declarado (incluye
 *   ValidationPipe, ForbiddenException de los guards, etc.).
 * - Cualquier otra excepción: 500 genérico. El stack trace SOLO se loguea en el
 *   servidor; nunca viaja al cliente (en producción se oculta por completo para
 *   no filtrar rutas internas ni dependencias).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor. Intentá nuevamente en unos minutos.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const record = payload as Record<string, unknown>;
        const rawMessage = record.message ?? record.error ?? exception.message;
        if (typeof rawMessage === 'string' || Array.isArray(rawMessage)) {
          message = rawMessage;
        }
      }
    } else if (exception instanceof Error) {
      // No controlada: se registra con stack en el servidor para diagnosticarla.
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    }

    if (status >= 500 && exception instanceof HttpException) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`Server error on ${request.method} ${request.url}: ${message}`, stack);
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}