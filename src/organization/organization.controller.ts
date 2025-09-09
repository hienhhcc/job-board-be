import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Auth } from 'src/user/decorators/auth.decorator';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { AuthGuard } from 'src/clerk/auth.guard';
import { InsertJobListingDto } from 'src/organization/dto/insert-job-listing.dto';

@Controller('/org')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Get(':orgId')
  getCurrentOrganization(
    @Param('orgId') orgId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    return this.organizationService.getCurrentOrganization(orgId, auth);
  }

  @Get(':orgId/job-listing/count-published')
  countPublishedJobListings(@Param('orgId') orgId: string) {
    return this.organizationService.countPublishedJobListings(orgId);
  }

  @Get(':orgId/job-listing/count-featured')
  countFeaturedJobListings(@Param('orgId') orgId: string) {
    return this.organizationService.countFeaturedJobListings(orgId);
  }

  @Get(':orgId/job-listing/recent')
  getMostRecentJobListing(@Param('orgId') orgId: string) {
    return this.organizationService.getMostRecentJobListing(orgId);
  }

  @Get('/:orgId/job-listing/:jobListingId')
  getJobListingById(
    @Param('orgId') orgId: string,
    @Param('jobListingId') jobListingId: string,
  ) {
    return this.organizationService.getJobListingById(orgId, jobListingId);
  }

  @Patch('/:orgId/job-listing/:jobListingId')
  updateJobListing(
    @Param('jobListingId') jobListingId: string,
    @Body() data: Partial<InsertJobListingDto>,
  ) {
    return this.organizationService.updateJobListing(jobListingId, data);
  }

  @Post('/:orgId/job-listing')
  insertJobListing(
    @Param('orgId') orgId: string,
    @Body() data: InsertJobListingDto,
  ) {
    return this.organizationService.insertJobListing(orgId, data);
  }
}
