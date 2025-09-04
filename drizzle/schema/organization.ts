import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { JobListingTable } from 'drizzle/schema/jobListing';
import { OrganizationUserSettingsTable } from 'drizzle/schema/organizationUserSetting';
import { createdAt, updatedAt } from 'drizzle/schemaHelpers';

export const OrganizationTable = pgTable('organizations', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt,
});

export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    jobListings: many(JobListingTable),
    organizationUserSettings: many(OrganizationUserSettingsTable),
  }),
);
