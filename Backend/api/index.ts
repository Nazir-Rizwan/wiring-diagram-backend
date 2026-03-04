import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';
import type { Request, Response } from 'express';

// Underlying Express instance shared across warm invocations
const expressApp = express();

// Cached NestJS app (reused between Vercel serverless invocations)
let app: INestApplication | null = null;

async function bootstrap(): Promise<void> {
  if (app) return; // already initialised on a warm instance

  app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );

  app.enableCors({ origin: '*', methods: ['GET'] });
  app.enableShutdownHooks();

  await app.init();
}

// Vercel calls this export as the serverless handler
export default async (req: Request, res: Response): Promise<void> => {
  await bootstrap();
  expressApp(req, res);
};
