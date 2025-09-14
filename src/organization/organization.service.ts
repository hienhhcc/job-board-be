import type { SignedInAuthObject } from '@clerk/backend/internal';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import {
  JobListingApplicationTable,
  OrganizationUserSettingsTable,
} from 'drizzle/schema';
import { JobListingTable } from 'drizzle/schema/jobListing';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { InsertJobListingDto } from 'src/organization/dto/insert-job-listing.dto';
import { UpdateOrganizationUserSettingsDto } from 'src/organization/dto/update-organization-user-settings.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getOrganizationUserSettings(orgId: string, userId: string) {
    const result =
      await this.drizzle.db.query.OrganizationUserSettingsTable.findFirst({
        where: and(
          eq(OrganizationUserSettingsTable.userId, userId),
          eq(OrganizationUserSettingsTable.organizationId, orgId),
        ),
        columns: {
          newApplicationEmailNotifications: true,
          minimumRating: true,
        },
      });

    if (result == null) {
      return { success: false, message: 'User settings not found' };
    }

    return { success: true, data: result };
  }

  async updateOrganizationUserSettings({
    userId,
    organizationId,
    data,
  }: {
    userId: string;
    organizationId: string;
    data: UpdateOrganizationUserSettingsDto;
  }) {
    const [updatedData] = await this.drizzle.db
      .insert(OrganizationUserSettingsTable)
      .values({ ...data, userId, organizationId })
      .onConflictDoUpdate({
        target: [
          OrganizationUserSettingsTable.userId,
          OrganizationUserSettingsTable.organizationId,
        ],
        set: data,
      })
      .returning();

    if (updatedData == null) {
      return {
        success: false,
        message: 'There was an error updating organization user settings',
      };
    }

    return { success: true, data: updatedData };
  }

  getCurrentOrganization(id: string, auth: SignedInAuthObject) {
    if (id !== auth.orgId) {
      throw new UnauthorizedException(
        `You don't have permission to perform this action`,
      );
    }

    return this.drizzle.getOrganization(id);
  }

  async getJobListings(orgId: string) {
    const data = await this.drizzle.db
      .select({
        id: JobListingTable.id,
        title: JobListingTable.title,
        status: JobListingTable.status,
        applicationCount: count(JobListingApplicationTable.userId),
      })
      .from(JobListingTable)
      .where(eq(JobListingTable.organizationId, orgId))
      .leftJoin(
        JobListingApplicationTable,
        eq(JobListingTable.id, JobListingApplicationTable.jobListingId),
      )
      .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
      .orderBy(desc(JobListingTable.createdAt));

    if (!data) {
      return {
        error: true,
        data: null,
        message: 'There was an error getting job listings',
      };
    }

    return { error: false, data };
  }

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
    const updatedData = {
      ...data,
      postedAt:
        data.postedAt && typeof data.postedAt === 'string'
          ? new Date(data.postedAt)
          : undefined,
    };
    const [updatedJobListing] = await this.drizzle.db
      .update(JobListingTable)
      .set(updatedData)
      .where(eq(JobListingTable.id, id))
      .returning({
        id: JobListingTable.id,
        organizationId: JobListingTable.organizationId,
      });

    if (!updatedJobListing)
      throw new NotFoundException('Cannot update job listing');

    return { success: true, updatedJobListing };
  }

  async deleteJobListingById(id: string) {
    const [deletedJobListing] = await this.drizzle.db
      .delete(JobListingTable)
      .where(eq(JobListingTable.id, id))
      .returning({
        id: JobListingTable.id,
        organizationId: JobListingTable.organizationId,
      });

    if (!deletedJobListing) return { success: false, deletedJobListing: null };

    return { success: true, deletedJobListing };
  }

  async countPublishedJobListings(orgId: string) {
    const [res] = await this.drizzle.db
      .select({ count: count() })
      .from(JobListingTable)
      .where(
        and(
          eq(JobListingTable.organizationId, orgId),
          eq(JobListingTable.status, 'draft'),
        ),
      );

    return res?.count ?? 0;
  }

  async countFeaturedJobListings(orgId: string) {
    const [res] = await this.drizzle.db
      .select({ count: count() })
      .from(JobListingTable)
      .where(
        and(
          eq(JobListingTable.organizationId, orgId),
          eq(JobListingTable.isFeatured, true),
        ),
      );

    return res?.count ?? 0;
  }

  async getJobListingApplicationsByJobListingId(
    organizationId: string,
    jobListingId: string,
  ) {
    const data =
      await this.drizzle.db.query.JobListingApplicationTable.findMany({
        where: eq(JobListingApplicationTable.jobListingId, jobListingId),
        columns: {
          coverLetter: true,
          createdAt: true,
          stage: true,
          rating: true,
          jobListingId: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
            },
            with: {
              resume: {
                columns: {
                  resumeFileUrl: true,
                  aiSummary: true,
                },
              },
            },
          },
        },
      });

    return data;
  }
}
