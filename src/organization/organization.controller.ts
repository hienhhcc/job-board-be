import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { UpdateOrganizationUserSettingsDto } from 'src/organization/dto/update-organization-user-settings.dto';

@Controller('/org')
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get(':orgId')
  getCurrentOrganization(
    @Param('orgId') orgId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    return this.organizationService.getCurrentOrganization(orgId, auth);
  }
  //* Users UserSettings
  @Get(':orgId/user/:userId/settings')
  getOrganizationUserSettings(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    if (userId !== auth.userId) {
      return new BadRequestException(
        'You dont have permission to perform this action',
      );
    }

    return this.organizationService.getOrganizationUserSettings(orgId, userId);
  }

  @Patch('/:orgId/user/:userId/settings')
  updateOrganizationUserSettings(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() data: UpdateOrganizationUserSettingsDto,
    @Auth() auth: SignedInAuthObject,
  ) {
    if (userId !== auth.userId) {
      return new BadRequestException(
        'You dont have permission to perform this action',
      );
    }

    return this.organizationService.updateOrganizationUserSettings({
      userId,
      organizationId: orgId,
      data,
    });
  }
  //* Job Listings
  @Get('/:orgId/job-listings')
  getJobListings(@Param('orgId') orgId: string) {
    return this.organizationService.getJobListings(orgId);
  }

  @Get(':orgId/job-listings/count-published')
  countPublishedJobListings(@Param('orgId') orgId: string) {
    return this.organizationService.countPublishedJobListings(orgId);
  }

  @Get(':orgId/job-listings/count-featured')
  countFeaturedJobListings(@Param('orgId') orgId: string) {
    return this.organizationService.countFeaturedJobListings(orgId);
  }

  @Get(':orgId/job-listings/recent')
  getMostRecentJobListing(@Param('orgId') orgId: string) {
    return this.organizationService.getMostRecentJobListing(orgId);
  }

  @Get('/:orgId/job-listings/:jobListingId')
  getJobListingById(
    @Param('orgId') orgId: string,
    @Param('jobListingId') jobListingId: string,
  ) {
    return this.organizationService.getJobListingById(orgId, jobListingId);
  }

  @Patch('/:orgId/job-listings/:jobListingId')
  updateJobListing(
    @Param('jobListingId') jobListingId: string,
    @Body() data: Partial<InsertJobListingDto>,
  ) {
    return this.organizationService.updateJobListing(jobListingId, data);
  }

  @Delete('/:orgId/job-listings/:jobListingId')
  deleteJobListingById(@Param('jobListingId') jobListingId: string) {
    return this.organizationService.deleteJobListingById(jobListingId);
  }

  @Post('/:orgId/job-listings')
  insertJobListing(
    @Param('orgId') orgId: string,
    @Body() data: InsertJobListingDto,
  ) {
    return this.organizationService.insertJobListing(orgId, data);
  }

  @Get('/:orgId/job-listings/:jobListingId/applications')
  getJobListingApplicationsByJobListingId(
    @Param('orgId') orgId: string,
    @Param('jobListingId') jobListingId: string,
  ) {
    return this.organizationService.getJobListingApplicationsByJobListingId(
      orgId,
      jobListingId,
    );
  }
}
