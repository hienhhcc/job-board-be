import { Injectable } from '@nestjs/common';
import { and, desc, eq, ilike, or, SQL } from 'drizzle-orm';
import { JobListingTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { GetPublishedJobListingQuery } from 'src/job-listings/dto/get-published-job-listings.dto';

@Injectable()
export class JobListingService {
  constructor(private readonly drizzle: DrizzleService) {}

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
}
