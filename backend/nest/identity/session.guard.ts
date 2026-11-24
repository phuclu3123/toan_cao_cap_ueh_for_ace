import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { requireAuth } from '../../src/modules/identity/index.js';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    let authenticated = false;
    // Reuse exactly the established cookie, revocation and session-version checks.
    await requireAuth(http.getRequest(), http.getResponse(), () => { authenticated = true; });
    return authenticated;
  }
}
