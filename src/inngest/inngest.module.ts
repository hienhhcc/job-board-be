import { Module } from '@nestjs/common';
import { InngestController } from './inngest.controller';

@Module({
  controllers: [InngestController],
  providers: [],
})
export class InngestModule {}
