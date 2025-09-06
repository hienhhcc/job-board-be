import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { JobListingTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Injectable()
export class JobListingService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getMostRecentJobListing(orgId: string) {
    return await this.drizzle.db.query.JobListingTable.findFirst({
      where: eq(JobListingTable.organizationId, orgId),
      orderBy: desc(JobListingTable.createdAt),
    });
  }
}
