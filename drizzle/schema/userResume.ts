import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { UserTable } from 'drizzle/schema/user';
import { createdAt, updatedAt } from 'drizzle/schemaHelpers';

export const UserResumeTable = pgTable('user_resumes', {
  userId: varchar()
    .primaryKey()
    .references(() => UserTable.id),
  resumeFileUrl: varchar().notNull(),
  resumeFileKey: varchar().notNull(),
  aiSummary: varchar(),
  createdAt,
  updatedAt,
});

export const userResumeRelations = relations(UserResumeTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserResumeTable.userId],
    references: [UserTable.id],
  }),
}));
