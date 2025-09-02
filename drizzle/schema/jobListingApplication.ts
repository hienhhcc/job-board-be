import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { UserTable } from 'drizzle/schema';
import { JobListingTable } from 'drizzle/schema/jobListing';
import { createdAt, updatedAt } from 'drizzle/schemaHelpers';

export const applicationStages = [
  'denied',
  'applied',
  'interested',
  'interviewed',
  'hired',
] as const;
export type ApplicationStage = (typeof applicationStages)[number];
export const applicationStageEnum = pgEnum(
  'job_listing_application_stage',
  applicationStages,
);

export const JobListingApplicationTable = pgTable(
  'job_listing_applications',
  {
    jobListingId: uuid()
      .references(() => JobListingTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: varchar()
      .references(() => UserTable.id, { onDelete: 'cascade' })
      .notNull(),
    coverLetter: varchar(),
    rating: integer(),
    stage: applicationStageEnum().notNull().default('applied'),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.jobListingId] })],
);

export const jobListingApplicationRelations = relations(
  JobListingApplicationTable,
  ({ one }) => ({
    jobListing: one(JobListingTable, {
      fields: [JobListingApplicationTable.jobListingId],
      references: [JobListingTable.id],
    }),
    user: one(UserTable, {
      fields: [JobListingApplicationTable.userId],
      references: [UserTable.id],
    }),
  }),
);
