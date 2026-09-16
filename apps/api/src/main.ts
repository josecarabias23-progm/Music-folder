import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/**
 * Resuelve la lista blanca de orígenes CORS.
 *
 * Acepta valores con o sin esquema (por ejemplo `https://app.onrender.com` o
 * `app.onrender.com`), de modo que `CORS_ORIGINS` pueda alimentarse desde
 * `fromService: { property: host }` en render.yaml sin romper la petición.
 *
 * En producción NO hay orígenes por defecto: si la variable no está definida se
 * bloquean las peticiones cross-origin (fail-closed) en lugar de permitir todas.
 */
export function resolveCorsOrigins(
  rawOrigins: string | undefined = process.env.CORS_ORIGINS,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string[] {
  const configured = (rawOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => (/^https?:\/\//i.test(origin) ? origin : `https://${origin}`))
    .map((origin) => origin.replace(/\/+$/, ''));

  if (configured.length > 0) {
    return configured;
  }

  return nodeEnv === 'production' ? [] : DEFAULT_DEV_ORIGINS;
}

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cabeceras básicas de seguridad en TODAS las respuestas. No reemplazan a
  // helmet (pendiente de Fase 4), pero cubren los vectores más comunes.
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Filtro global: normaliza TODOS los errores al formato
  // { statusCode, message, timestamp, path } y nunca expone stack traces.
  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigins = resolveCorsOrigins();
  if (isProduction && corsOrigins.length === 0) {
    logger.warn(
      'CORS_ORIGINS no está definido: en producción se rechazarán todas las peticiones cross-origin. Definí CORS_ORIGINS en el panel de Render.',
    );
  }

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

// Documentación interactiva de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Music Folder API')
    .setDescription('API para partituras, instrumentos, ensayos y foros.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`API listening on http://localhost:${port}/api/v1`);
  logger.log(`Swagger available at http://localhost:${port}/api/docs`);
}

bootstrap();
