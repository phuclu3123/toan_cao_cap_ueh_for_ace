import { Injectable } from '@nestjs/common';
import { getResources, createResource, incrementResourceView } from '../../src/modules/resources/index.js';

export interface ResourceActor { id: string; username?: string; email?: string; role?: string }
export interface CreateResourceInput { type?: string; item?: Record<string, unknown> }

@Injectable()
export class ResourcesService {
  list() { return getResources(); }
  create(body: CreateResourceInput | undefined, user: ResourceActor) { return createResource({ body, user }); }
  incrementView(id: string) { return incrementResourceView({ id }); }
}
