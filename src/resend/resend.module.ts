import { Module } from '@nestjs/common';
import { ResendService } from './resend.service';

@Module({
  controllers: [],
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
