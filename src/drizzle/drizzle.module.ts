import { Module } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
