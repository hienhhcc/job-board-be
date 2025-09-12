import { SignedInAuthObject } from '@clerk/backend/internal';
import { BadRequestException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UserResumeTable } from 'drizzle/schema';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { InngestService } from 'src/inngest/inngest.service';
import { UpsertUserResumeDto } from 'src/user/dto/upsert-user-resume.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly inngest: InngestService,
  ) {}

  getMe(id: string) {
    return this.drizzle.getMe(id);
  }

  async getUserResume(id: string) {
    const resume = await this.drizzle.db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, id),
    });

    return { success: true, data: resume };
  }

  async sendInngestResumeUploadedEvent(id: string, auth: SignedInAuthObject) {
    if (id !== auth.userId) {
      return new BadRequestException();
    }
    await this.inngest.inngest.send({
      name: 'app/resume.uploaded',
      data: {
        id,
      },
    });

    return { success: true };
  }

  async upsertUserResume(userId: string, data: UpsertUserResumeDto) {
    await this.drizzle.db
      .insert(UserResumeTable)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: UserResumeTable.userId,
        set: data,
      });
    return { success: true };
  }
}
