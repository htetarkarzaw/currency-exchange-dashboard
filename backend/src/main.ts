import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env (backend runs from backend/ dir)
config({ path: resolve(__dirname, '../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // Allow all origins in dev
  await app.listen(process.env.BACKEND_PORT ?? process.env.PORT ?? 3001);
}
bootstrap();
