import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { ClerkModule } from 'src/clerk/clerk.module';
import { InngestModule } from 'src/inngest/inngest.module';

@Module({
  imports: [ClerkModule, DrizzleModule, InngestModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
