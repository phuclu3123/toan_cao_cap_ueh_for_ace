import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Source modules own the model instances in BOTH runtimes. Compiling the Nest
// shell never emits a second copy of Mongoose models or changes collection names.
export const runtime = process.env.BACKEND_HTTP_RUNTIME || 'nest';
if (!['nest', 'express'].includes(runtime)) throw new Error('BACKEND_HTTP_RUNTIME must be nest or express.');
const application = runtime === 'nest'
  ? await (await import('./dist/bootstrap.js')).createApplication()
  : null;
export const app = application
  ? application.getHttpAdapter().getInstance()
  : (await import('./src/app/express-app.js')).createExpressApp({ nativeResources: false });

export async function startServer() {
  if (application) return (await import('./dist/bootstrap.js')).startApplication(application);
  await (await import('./src/app/storage.js')).initializeStorage();
  const configured = Number.parseInt(process.env.PORT || '5000', 10);
  const port = Number.isInteger(configured) && configured > 0 ? configured : 5000;
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(port, () => resolve(listener));
    listener.once('error', reject);
  });
  server.once('close', async () => (await import('./src/app/storage.js')).stopBackgroundWork());
  (await import('./src/app/storage.js')).startBackgroundWork();
  console.log('Backend modular Express listening on port ' + port);
  return server;
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry === fileURLToPath(import.meta.url)) {
  startServer().catch(async error => {
    (await import('./src/app/storage.js')).stopBackgroundWork();
    if (application) await application.close().catch(() => {});
    await (await import('mongoose')).default.disconnect().catch(() => {});
    console.error('Backend failed to start:', error.code || error.message);
    if (error.code === 'EADDRINUSE') console.error('Another backend already owns this port. Stop that dev process before starting a second one.');
    process.exitCode = 1;
  });
}
