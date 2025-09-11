import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { InngestModule } from 'src/inngest/inngest.module';
import { UserModule } from './user/user.module';
import { ClerkModule } from './clerk/clerk.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { OrganizationModule } from './organization/organization.module';
import { JobListingModule } from './job-listings/job-listings.module';

@Module({
  imports: [
    DevtoolsModule.register({ http: process.env.NODE_ENV !== 'production' }),
    ConfigModule.forRoot({ isGlobal: true }),
    InngestModule,
    UserModule,
    ClerkModule,
    OrganizationModule,
    JobListingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
