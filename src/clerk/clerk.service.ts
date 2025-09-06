import { Injectable } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkService {
  private clerkClient;

  constructor(private config: ConfigService) {
    this.clerkClient = createClerkClient({
      secretKey: this.config.get('CLERK_SECRET_KEY'),
      publishableKey: this.config.get('CLERK_PUBLISHABLE_KEY'),
    });
  }

  async authenticate(req: Request) {
    const jwtKey = Buffer.from(
      this.config.get<string>('CLERK_JWT_KEY')!,
      'base64',
    ).toString('utf-8');

    return this.clerkClient.authenticateRequest(req, {
      jwtKey,
      authorizedParties: ['http://localhost:3000'],
    });
  }
}
