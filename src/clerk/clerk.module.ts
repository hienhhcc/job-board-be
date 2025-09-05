import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { AuthGuard } from 'src/clerk/auth.guard';

@Module({
  providers: [ClerkService, AuthGuard],
  exports: [ClerkService, AuthGuard],
})
export class ClerkModule {}
