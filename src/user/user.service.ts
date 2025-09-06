import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Injectable()
export class UserService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getMe(id: string) {
    return this.drizzleService.getMe(id);
  }
}
