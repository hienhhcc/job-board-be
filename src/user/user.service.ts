import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UserResumeTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Injectable()
export class UserService {
  constructor(private readonly drizzle: DrizzleService) {}

  getMe(id: string) {
    return this.drizzle.getMe(id);
  }

  async getUserResume(id: string) {
    const resume = await this.drizzle.db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, id),
    });

    return { success: true, data: resume };
  }
}
