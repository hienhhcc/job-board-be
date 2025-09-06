import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Auth } from 'src/user/decorators/auth.decorator';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { AuthGuard } from 'src/clerk/auth.guard';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  getCurrentOrganization(
    @Param('id') id: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    return this.organizationService.getCurrentOrganization(id, auth);
  }
}
