import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { handleApplicationError } from '../../src/app/http-errors.js';

@Catch()
export class CompatibilityFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    // requireAuth already sends its exact 401/503 envelope before denying a guard.
    if (http.getResponse().headersSent) return;
    handleApplicationError(exception, http.getRequest(), http.getResponse(), undefined);
  }
}
