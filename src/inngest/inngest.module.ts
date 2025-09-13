import { Module } from '@nestjs/common';
import { InngestController } from './inngest.controller';
import { InngestService } from 'src/inngest/inngest.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { ResendModule } from 'src/resend/resend.module';

@Module({
  imports: [DrizzleModule, ResendModule],
  controllers: [InngestController],
  providers: [InngestService],
  exports: [InngestService],
})
export class InngestModule {}
