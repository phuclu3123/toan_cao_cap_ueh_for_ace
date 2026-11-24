import { Module } from '@nestjs/common';
import { ResourcesModule } from './resources/resources.module.js';
import { LifecycleService } from './lifecycle.service.js';

// Native Nest features are added here as their HTTP adapters are migrated.
@Module({ imports: [ResourcesModule], providers: [LifecycleService] })
export class AppModule {}
