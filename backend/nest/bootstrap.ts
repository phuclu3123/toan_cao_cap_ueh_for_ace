import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { CompatibilityFilter } from './http/compatibility.filter.js';
import { createExpressApp } from '../src/app/express-app.js';
import { initializeStorage, startBackgroundWork, stopBackgroundWork } from '../src/app/storage.js';

export async function createApplication() {
  const legacyApp = createExpressApp({ nativeResources: true });
  const application = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(legacyApp), {
    bodyParser: false, // Existing 10 MB JSON/form parsers and webhook payload handling.
    logger: ['error', 'warn', 'log'],
    abortOnError: false
  });
  application.useGlobalFilters(new CompatibilityFilter());
  application.enableShutdownHooks();
  await application.init();
  return application;
}

export async function startApplication(application: NestExpressApplication) {
  await initializeStorage();
  const configured = Number.parseInt(process.env.PORT || '5000', 10);
  const port = Number.isInteger(configured) && configured > 0 ? configured : 5000;
  const server = await application.listen(port);
  startBackgroundWork();
  server.once('close', stopBackgroundWork);
  console.log(`Backend NestJS + modular Express listening on port ${port}`);
  return server;
}
