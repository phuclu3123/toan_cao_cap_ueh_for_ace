import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import net from 'node:net';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const configuredPort = Number.parseInt(process.env.PORT || '5000', 10);
const port = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 5000;
const available = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', error => error.code === 'EADDRINUSE' ? resolve(false) : reject(error));
  probe.listen(port, () => probe.close(() => resolve(true)));
});
if (!available) {
  console.error(`[Backend dev] Port ${port} is already in use. Use the running backend or stop it before starting another dev process.`);
  process.exit(1);
}
const children = [
  spawn(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--watch', '--preserveWatchOutput'], { cwd, stdio: 'inherit', windowsHide: true }),
  spawn(process.execPath, ['--watch', 'server.js'], { cwd, stdio: 'inherit', windowsHide: true })
];
let stopping = false;
const stop = (code = 0) => {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
};
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => stop(code || 0));
}
