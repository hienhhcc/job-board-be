import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InngestModule } from './inngest/inngest.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), InngestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
