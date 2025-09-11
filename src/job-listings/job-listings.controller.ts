import { Controller, Get, Query } from '@nestjs/common';
import { JobListingService } from './job-listings.service';
import { GetPublishedJobListingQuery } from 'src/job-listings/dto/get-published-job-listings.dto';

@Controller('job-listings')
export class JobListingController {
  constructor(private readonly jobListingService: JobListingService) {}

  @Get()
  getPublishedJobListings(@Query() query: GetPublishedJobListingQuery) {
    return this.jobListingService.getPublishedJobListings(query);
  }
}
