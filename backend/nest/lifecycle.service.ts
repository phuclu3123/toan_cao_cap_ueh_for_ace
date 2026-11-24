import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { stopBackgroundWork } from '../src/app/storage.js';

@Injectable()
export class LifecycleService implements OnApplicationShutdown {
  onApplicationShutdown() { stopBackgroundWork(); }
}
