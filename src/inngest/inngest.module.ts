import { Module } from '@nestjs/common';
import { InngestController } from './inngest.controller';
import { InngestService } from 'src/inngest/inngest.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [InngestController],
  // controllers: [],
  providers: [InngestService],
})
export class InngestModule {}
