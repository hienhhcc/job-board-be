import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobListingService } from './job-listing.service';
import { AuthGuard } from 'src/clerk/auth.guard';

@Controller('job-listing')
export class JobListingController {
  constructor(private readonly jobListingService: JobListingService) {}

  @UseGuards(AuthGuard)
  @Get('/org/:orgId/recent')
  getMostRecentJobListing(@Param('orgId') orgId: string) {
    return this.jobListingService.getMostRecentJobListing(orgId);
  }
}
