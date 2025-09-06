import type { SignedInAuthObject } from '@clerk/backend/internal';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly drizzle: DrizzleService) {}

  getCurrentOrganization(id: string, auth: SignedInAuthObject) {
    if (id !== auth.orgId) {
      throw new UnauthorizedException(
        `You don't have permission to perform this action`,
      );
    }

    return this.drizzle.getOrganization(id);
  }
}
