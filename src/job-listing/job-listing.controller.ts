import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JobListingService } from './job-listing.service';
import { AuthGuard } from 'src/clerk/auth.guard';
import { InsertJobListingDto } from 'src/job-listing/dto/insert-job-listing.dto';

@Controller('job-listing')
@UseGuards(AuthGuard)
export class JobListingController {
  constructor(private readonly jobListingService: JobListingService) {}

  @Get('/org/:orgId/recent')
  getMostRecentJobListing(@Param('orgId') orgId: string) {
    return this.jobListingService.getMostRecentJobListing(orgId);
  }

  @Get('/org/:orgId/:jobListingId')
  getJobListingById(
    @Param('orgId') orgId: string,
    @Param('jobListingId') jobListingId: string,
  ) {
    return this.jobListingService.getJobListingById(orgId, jobListingId);
  }

  @Patch('/org/:orgId/:jobListingId')
  updateJobListing(
    @Param('jobListingId') jobListingId: string,
    @Body() data: Partial<InsertJobListingDto>,
  ) {
    return this.jobListingService.updateJobListing(jobListingId, data);
  }

  @Post('/org/:orgId')
  insertJobListing(
    @Param('orgId') orgId: string,
    @Body() data: InsertJobListingDto,
  ) {
    return this.jobListingService.insertJobListing(orgId, data);
  }
}
