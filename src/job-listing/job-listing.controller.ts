import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobListingService } from './job-listing.service';
import { AuthGuard } from 'src/clerk/auth.guard';
import { InsertJobListingDto } from 'src/job-listing/dto/insert-job-listing.dto';

@Controller('job-listing')
export class JobListingController {
  constructor(private readonly jobListingService: JobListingService) {}

  @UseGuards(AuthGuard)
  @Get('/org/:orgId/recent')
  getMostRecentJobListing(@Param('orgId') orgId: string) {
    return this.jobListingService.getMostRecentJobListing(orgId);
  }

  @UseGuards(AuthGuard)
  @Post('/org/:orgId')
  insertJobListing(
    @Param('orgId') orgId: string,
    @Body() data: InsertJobListingDto,
  ) {
    return this.jobListingService.insertJobListing(orgId, data);
  }
}
