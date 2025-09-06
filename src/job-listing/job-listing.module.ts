import { Module } from '@nestjs/common';
import { JobListingService } from './job-listing.service';
import { JobListingController } from './job-listing.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { ClerkModule } from 'src/clerk/clerk.module';

@Module({
  imports: [DrizzleModule, ClerkModule],
  controllers: [JobListingController],
  providers: [JobListingService],
})
export class JobListingModule {}
