import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/clerk/auth.guard';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { Auth } from 'src/user/decorators/auth.decorator';
import { UpsertUserResumeDto } from 'src/user/dto/upsert-user-resume.dto';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  getMe(@Auth() auth: SignedInAuthObject) {
    return this.userService.getMe(auth.userId);
  }

  @Get('/:userId/resume')
  getUserResume(
    @Param('userId') userId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    if (userId !== auth.userId) {
      return new BadRequestException('Bad request');
    }

    return this.userService.getUserResume(userId);
  }

  @Put('/:userId/resume')
  upsertUserResume(
    @Param('userId') userId: string,
    @Auth() auth: SignedInAuthObject,
    @Body() data: UpsertUserResumeDto,
  ) {
    if (userId !== auth.userId) {
      return new BadRequestException('Bad request');
    }

    return this.userService.upsertUserResume(userId, data);
  }

  @Get('/:userId/resume-uploaded-event')
  sendInngestResumeUploadedEvent(
    @Param('userId') userId: string,
    @Auth() auth: SignedInAuthObject,
  ) {
    return this.userService.sendInngestResumeUploadedEvent(userId, auth);
  }
}
