import { Module } from '@nestjs/common';
import { SessionGuard } from './session.guard.js';

@Module({ providers: [SessionGuard], exports: [SessionGuard] })
export class IdentityModule {}
