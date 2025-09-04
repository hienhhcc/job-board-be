import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { InngestModule } from 'src/inngest/inngest.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), InngestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
