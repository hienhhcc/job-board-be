import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  public async insertUser(user: typeof UserTable.$inferInsert) {
    await this.db.insert(UserTable).values(user).onConflictDoNothing();
  }
  public async insertUserNotificationSetting(
    settings: typeof schema.UserNotificationSettingsTable.$inferInsert,
  ) {
    await this.db
      .insert(schema.UserNotificationSettingsTable)
      .values(settings)
      .onConflictDoNothing();
  }
}
