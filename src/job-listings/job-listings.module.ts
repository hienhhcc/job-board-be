import { Module } from '@nestjs/common';
import { JobListingController } from 'src/job-listings/job-listings.controller';
import { JobListingService } from 'src/job-listings/job-listings.service';
import { ClerkModule } from 'src/clerk/clerk.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { InngestModule } from 'src/inngest/inngest.module';

@Module({
  imports: [ClerkModule, DrizzleModule, InngestModule],
  controllers: [JobListingController],
  providers: [JobListingService],
})
export class JobListingModule {}
