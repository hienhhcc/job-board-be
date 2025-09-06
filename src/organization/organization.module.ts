import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ClerkModule } from 'src/clerk/clerk.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [ClerkModule, DrizzleModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
