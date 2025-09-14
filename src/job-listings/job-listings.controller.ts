import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobListingService } from './job-listings.service';
import { GetPublishedJobListingQuery } from 'src/job-listings/dto/get-published-job-listings.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { AuthGuard } from 'src/clerk/auth.guard';
import { InsertJobListingApplicationDto } from 'src/job-listings/dto/insert-job-listing-application.dto';

@Controller('job-listings')
export class JobListingController {
  constructor(private readonly jobListingService: JobListingService) {}

  @Get()
  getPublishedJobListings(@Query() query: GetPublishedJobListingQuery) {
    return this.jobListingService.getPublishedJobListings(query);
  }

  @Get('/:jobListingId')
  getPublishedJobListingById(@Param('jobListingId') jobListingId: string) {
    return this.jobListingService.getPublishedJobListingById(jobListingId);
  }

  @UseGuards(AuthGuard)
  @Get('/:jobListingId/applications')
  getJobListingApplicationByJobListingIdAndUserId(
    @Param('jobListingId') jobListingId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    return this.jobListingService.getJobListingApplicationByJobListingIdAndUserId(
      jobListingId,
      auth,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/:jobListingId/applications')
  insertJobListingApplication(
    @Param('jobListingId') jobListingId: string,
    @Auth() auth: SignedInAuthObject,
    @Body() body: InsertJobListingApplicationDto,
  ) {
    return this.jobListingService.insertJobListingApplication(
      jobListingId,
      auth,
      body.coverLetter,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:jobListingId/applications/:userId')
  updateJobListingApplication(
    @Param('jobListingId') jobListingId: string,
    @Param('userId') userId: string,
    @Body() body: Partial<InsertJobListingApplicationDto>,
  ) {
    return this.jobListingService.updateJobListingApplication(
      jobListingId,
      userId,
      body,
    );
  }
}
