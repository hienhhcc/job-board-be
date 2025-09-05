import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkService } from 'src/clerk/clerk.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly clerk: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    try {
      const clerkCompaibleRequest = {
        headers: { ...request.headers },
        method: request.method,
        url: `${request.protocol}://${request.host}${request.originalUrl}`,
      };
      const authenticate = await this.clerk.authenticate(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        clerkCompaibleRequest as any,
      );

      if (!authenticate.isAuthenticated) {
        throw new UnauthorizedException('Invalid Clerk session');
      }

      // if (!userId || !sessionId)
      //   throw new UnauthorizedException('Invalid Clerk session');

      // // Attach to request for downstream usage
      // (req as any).userId = userId;
      // (req as any).sessionId = sessionId;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Authentication failed', err);
    }
  }
}
