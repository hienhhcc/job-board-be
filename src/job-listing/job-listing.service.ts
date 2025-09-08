import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { JobListingTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { InsertJobListingDto } from 'src/job-listing/dto/insert-job-listing.dto';

@Injectable()
export class JobListingService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getMostRecentJobListing(orgId: string) {
    return await this.drizzle.db.query.JobListingTable.findFirst({
      where: eq(JobListingTable.organizationId, orgId),
      orderBy: desc(JobListingTable.createdAt),
      columns: { id: true },
    });
  }

  async insertJobListing(orgId: string, data: InsertJobListingDto) {
    const [newListing] = await this.drizzle.db
      .insert(JobListingTable)
      .values({ ...data, organizationId: orgId, status: 'draft' })
      .returning({
        id: JobListingTable.id,
        organizationId: JobListingTable.organizationId,
      });

    if (!newListing) {
      throw new ForbiddenException('Cant create new job listing');
    }

    return newListing;
  }

  async getJobListingById(orgId: string, jobListingId: string) {
    return this.drizzle.db.query.JobListingTable.findFirst({
      where: and(
        eq(JobListingTable.id, jobListingId),
        eq(JobListingTable.organizationId, orgId),
      ),
    });
  }

  async updateJobListing(id: string, data: Partial<InsertJobListingDto>) {
    const [updatedJobListing] = await this.drizzle.db
      .update(JobListingTable)
      .set(data)
      .where(eq(JobListingTable.id, id))
      .returning({
        id: JobListingTable.id,
        organizationId: JobListingTable.organizationId,
      });

    if (!updatedJobListing)
      throw new NotFoundException('Cannot update job listing');

    return { success: true, updatedJobListing };
  }
}
