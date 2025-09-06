import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/clerk/auth.guard';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import { Auth } from 'src/user/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  getMe(@Auth() auth: SignedInAuthObject) {
    return this.userService.getMe(auth.userId);
  }
}
