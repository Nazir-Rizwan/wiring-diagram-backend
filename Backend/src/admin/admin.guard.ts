import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Checks the `x-admin-secret` header against the ADMIN_SECRET env variable.
 * Protects all POST routes on AdminController.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Accept secret from header OR from JSON body (for the HTML form fetch call)
    const secret =
      (req.headers['x-admin-secret'] as string) ?? req.body?.secret;

    const expected = this.config.get<string>('ADMIN_SECRET');

    if (!expected) {
      throw new UnauthorizedException('ADMIN_SECRET env variable is not set');
    }
    if (secret !== expected) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
