import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/clerk/auth.guard';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { Auth } from 'src/user/decorators/auth.decorator';

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
}
