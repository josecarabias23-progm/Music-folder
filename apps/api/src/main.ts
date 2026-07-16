import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Music Folder API')
    .setDescription('API for musicians and orchestras to manage scores, instruments, rehearsals, and community discussions')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'System health checks')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Sheets', 'Score/Sheet music management')
    .addTag('Instruments', 'Musical instruments encyclopedia')
    .addTag('Records', 'Rehearsal logs and recordings')
    .addTag('Forums', 'Community forum discussions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.API_PORT || process.env.PORT || 3000);
  await app.listen(port);
  console.log(`🎵 Music Folder API running on http://localhost:${port}`);
  console.log(`📚 Documentation available at http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
