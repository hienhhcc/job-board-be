import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InngestModule } from './inngest/inngest.module';

@Module({
  imports: [InngestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
