import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { ResourcesController } from './resources.controller.js';
import { ResourcesService } from './resources.service.js';

@Module({ imports: [IdentityModule], controllers: [ResourcesController], providers: [ResourcesService] })
export class ResourcesModule {}
