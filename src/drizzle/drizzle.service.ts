import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from 'drizzle/schema';
import { UserTable } from 'drizzle/schema';

@Injectable()
export class DrizzleService {
  public db;

  constructor(private config: ConfigService) {
    this.db = drizzle(
      `postgresql://${this.config.get('DB_USER')}:${this.config.get('DB_PASSWORD')}@${this.config.get('DB_HOST')}:${this.config.get('DB_PORT')}/${this.config.get('DB_NAME')}`,
      { schema },
    );
  }
  //* User
  public async getMe(id: string) {
    const [user] = await this.db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, id));

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return user;
  }

  public async insertUser(user: typeof UserTable.$inferInsert) {
    await this.db.insert(UserTable).values(user).onConflictDoNothing();
  }

  public async updateUser(
    id: string,
    user: Partial<typeof UserTable.$inferInsert>,
  ) {
    await this.db.update(UserTable).set(user).where(eq(UserTable.id, id));
  }

  public async deleteUser(id: string) {
    await this.db.delete(UserTable).where(eq(UserTable.id, id));
  }

  public async insertUserNotificationSettings(
    settings: typeof schema.UserNotificationSettingsTable.$inferInsert,
  ) {
    await this.db
      .insert(schema.UserNotificationSettingsTable)
      .values(settings)
      .onConflictDoNothing();
  }
}
