import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InstrumentsSeedService } from './instruments/seed.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  try {
    const seedService = appContext.get(InstrumentsSeedService);
    if (!seedService) {
      console.error('InstrumentsSeedService not found in app context');
      process.exit(1);
    }
    await seedService.seed();
    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  } finally {
    await appContext.close();
  }
}

bootstrap();
