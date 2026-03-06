import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow Electron app (and any origin) to call this endpoint
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Status backend running on port ${port}`);
}
bootstrap();

