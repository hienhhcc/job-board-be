import { relations } from 'drizzle-orm';
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';
import { UserTable } from 'drizzle/schema';
import { createdAt, updatedAt } from 'drizzle/schemaHelpers';

export const UserNotificationSettingsTable = pgTable(
  'user_notification_settings',
  {
    userId: varchar()
      .primaryKey()
      .references(() => UserTable.id),
    newJobEmailNotifications: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt,
  },
);

export const userNotificationSettingsRelations = relations(
  UserNotificationSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserNotificationSettingsTable.userId],
      references: [UserTable.id],
    }),
  }),
);
