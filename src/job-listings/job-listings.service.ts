import type { SignedInAuthObject } from '@clerk/backend/internal';
import { Injectable } from '@nestjs/common';
import { and, desc, eq, ilike, or, SQL } from 'drizzle-orm';
import { JobListingApplicationTable, JobListingTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { InngestService } from 'src/inngest/inngest.service';
import { GetPublishedJobListingQuery } from 'src/job-listings/dto/get-published-job-listings.dto';

@Injectable()
export class JobListingService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly inngestService: InngestService,
  ) {}

  async getPublishedJobListings(query: GetPublishedJobListingQuery) {
    const whereConditions: (SQL | undefined)[] = [];

    const jobListingId = query.jobListingId;

    if (query.title) {
      whereConditions.push(ilike(JobListingTable.title, `%${query.title}%`));
    }

    if (query.locationRequirement) {
      whereConditions.push(
        eq(JobListingTable.locationRequirement, query.locationRequirement),
      );
    }

    if (query.city) {
      whereConditions.push(ilike(JobListingTable.city, `%${query.city}%`));
    }

    if (query.state) {
      whereConditions.push(eq(JobListingTable.stateAbbreviation, query.state));
    }

    if (query.experience) {
      whereConditions.push(
        eq(JobListingTable.experienceLevel, query.experience),
      );
    }

    if (query.type) {
      whereConditions.push(eq(JobListingTable.type, query.type));
    }

    if (query.jobIds) {
      whereConditions.push(
        or(...query.jobIds.map((jobId) => eq(JobListingTable.id, jobId))),
      );
    }

    const jobListings = await this.drizzle.db.query.JobListingTable.findMany({
      where: or(
        jobListingId
          ? and(
              eq(JobListingTable.status, 'published'),
              eq(JobListingTable.id, jobListingId),
            )
          : undefined,
        and(eq(JobListingTable.status, 'published'), ...whereConditions),
      ),
      with: {
        organization: {
          columns: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        desc(JobListingTable.isFeatured),
        desc(JobListingTable.postedAt),
      ],
    });

    if (jobListings == null) {
      return {
        success: false,
        message: 'There was an error getting job listings',
      };
    }

    return {
      success: true,
      data: jobListings,
    };
  }

  async getPublishedJobListingById(jobListingId: string) {
    const jobListing = await this.drizzle.db.query.JobListingTable.findFirst({
      where: and(
        eq(JobListingTable.id, jobListingId),
        eq(JobListingTable.status, 'published'),
      ),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    if (jobListing == null) {
      return { success: false, message: 'Job listing not found' };
    }

    return {
      success: true,
      data: jobListing,
    };
  }

  async getJobListingApplicationByJobListingIdAndUserId(
    jobListingId: string,
    auth: SignedInAuthObject,
  ) {
    const jobListingApplication =
      await this.drizzle.db.query.JobListingApplicationTable.findFirst({
        where: and(
          eq(JobListingApplicationTable.jobListingId, jobListingId),
          eq(JobListingApplicationTable.userId, auth.userId),
        ),
      });
    return { success: true, data: jobListingApplication };
  }

  async insertJobListingApplication(
    jobListingId: string,
    auth: SignedInAuthObject,
    coverLetter: string | undefined,
  ) {
    const insertedJobListingApplication = await this.drizzle.db
      .insert(JobListingApplicationTable)
      .values({
        jobListingId,
        userId: auth.userId,
        coverLetter,
      })
      .onConflictDoNothing({
        target: [
          JobListingApplicationTable.jobListingId,
          JobListingApplicationTable.userId,
        ],
      });

    if (insertedJobListingApplication == null) {
      return {
        success: false,
        message: 'There was an error inserting job listing application',
      };
    }

    return { success: true, data: insertedJobListingApplication };
  }
}
