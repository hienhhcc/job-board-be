import { Injectable } from '@nestjs/common';
import {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
} from '@clerk/backend';
import { EventSchemas, GetEvents, Inngest } from 'inngest';
import { serve } from 'inngest/express';
import { NonRetriableError } from 'inngest';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { and, eq, gte } from 'drizzle-orm';
import { JobListingTable, UserNotificationSettingsTable } from 'drizzle/schema';
import { subDays } from 'date-fns';
import { ResendService } from 'src/resend/resend.service';

type ClerkWebhookData<T> = {
  data: {
    data: T;
    raw: string;
    headers: Record<string, string>;
  };
};

type Events = {
  'clerk/user.created': ClerkWebhookData<UserJSON>;
  'clerk/user.updated': ClerkWebhookData<UserJSON>;
  'clerk/user.deleted': ClerkWebhookData<DeletedObjectJSON>;
  'clerk/organization.created': ClerkWebhookData<OrganizationJSON>;
  'clerk/organization.updated': ClerkWebhookData<OrganizationJSON>;
  'clerk/organization.deleted': ClerkWebhookData<DeletedObjectJSON>;
  'clerk/organizationMembership.created': ClerkWebhookData<OrganizationMembershipJSON>;
  'clerk/organizationMembership.deleted': ClerkWebhookData<OrganizationMembershipJSON>;
  'app/jobListingApplication.created': {
    data: {
      jobListingId: string;
      userId: string;
    };
  };
  'app/resume.uploaded': {
    data: {
      id: string;
    };
  };
  'app/email.daily-user-job-listings': {
    data: {
      aiPrompt?: string;
      jobListings: (Omit<
        typeof JobListingTable.$inferSelect,
        'createdAt' | 'postedAt' | 'updatedAt' | 'status' | 'organizationId'
      > & { organizationName: string })[];
    };
    user: {
      email: string;
      name: string;
    };
  };
};

@Injectable()
export class InngestService {
  constructor(
    private config: ConfigService,
    private drizzle: DrizzleService,
    private resendService: ResendService,
  ) {}

  public inngest = new Inngest({
    id: 'work-hive',
    schemas: new EventSchemas().fromRecord<Events>(),
  });

  private verifyWebHook({
    raw,
    headers,
  }: {
    raw: string;
    headers: Record<string, string>;
  }) {
    return new Webhook(
      this.config.get<string>('CLERK_WEBHOOK_SIGNING_SECRET') as string,
    ).verify(raw, headers);
  }

  clerkCreateUser = this.inngest.createFunction(
    {
      id: 'clerk/create-db-user',
      name: 'Clerk - Create DB User',
    },
    { event: 'clerk/user.created' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      const userId = await step.run('create-user', async () => {
        const userData = event.data.data;
        const email = userData.email_addresses.find(
          (e) => e.id === userData.primary_email_address_id,
        );

        if (!email) {
          throw new NonRetriableError('No primary email address found');
        }

        await this.drizzle.insertUser({
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`,
          imageUrl: userData.image_url,
          email: email.email_address,
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at),
        });

        return userData.id;
      });

      await step.run('create-user-notification-settings', async () => {
        await this.drizzle.insertUserNotificationSettings({ userId });
      });
    },
  );

  clerkUpdateUser = this.inngest.createFunction(
    { id: 'clerk/update-db-user', name: 'Clerk - Update DB User' },
    { event: 'clerk/user.updated' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      await step.run('update-user', async () => {
        const userData = event.data.data;
        const email = userData.email_addresses.find(
          (email) => email.id === userData.primary_email_address_id,
        );

        if (email == null) {
          throw new NonRetriableError('No primary email address found');
        }

        await this.drizzle.updateUser(userData.id, {
          name: `${userData.first_name} ${userData.last_name}`,
          imageUrl: userData.image_url,
          email: email.email_address,
          updatedAt: new Date(userData.updated_at),
        });
      });
    },
  );

  clerkDeleteUser = this.inngest.createFunction(
    { id: 'clerk/delete-db-user', name: 'Clerk - Delete DB User' },
    {
      event: 'clerk/user.deleted',
    },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        await this.verifyWebHook({
          raw: event.data.raw,
          headers: event.data.headers,
        });
      });

      await step.run('delete-user', async () => {
        const { id } = event.data.data;

        if (id == null) {
          throw new NonRetriableError('No id found');
        }

        await this.drizzle.deleteUser(id);
      });
    },
  );

  clerkCreateOrganization = this.inngest.createFunction(
    {
      id: 'clerk/create-db-organization',
      name: 'Clerk - Create DB Organization',
    },
    { event: 'clerk/organization.created' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      await step.run('create-organization', async () => {
        const orgData = event.data.data;

        await this.drizzle.insertOrganization({
          id: orgData.id,
          name: orgData.name,
          imageUrl: orgData.image_url,
          createdAt: new Date(orgData.created_at),
          updatedAt: new Date(orgData.updated_at),
        });
      });
    },
  );

  clerkUpdateOrganization = this.inngest.createFunction(
    {
      id: 'clerk/update-db-organization',
      name: 'Clerk - Update DB Organization',
    },
    { event: 'clerk/organization.updated' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      await step.run('update-organization', async () => {
        const orgData = event.data.data;

        await this.drizzle.updateOrganization(orgData.id, {
          name: orgData.name,
          imageUrl: orgData.image_url,
          updatedAt: new Date(orgData.updated_at),
        });
      });
    },
  );

  clerkDeleteOrganization = this.inngest.createFunction(
    {
      id: 'clerk/delete-db-organization',
      name: 'Clerk - Delete DB Organization',
    },
    {
      event: 'clerk/organization.deleted',
    },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        await this.verifyWebHook({
          raw: event.data.raw,
          headers: event.data.headers,
        });
      });

      await step.run('delete-organization', async () => {
        const { id } = event.data.data;

        if (id == null) {
          throw new NonRetriableError('No id found');
        }

        await this.drizzle.deleteOrganization(id);
      });
    },
  );

  clerkCreateOrgMembership = this.inngest.createFunction(
    {
      id: 'clerk/create-organization-user-settings',
      name: 'Clerk - Create Organization User Settings',
    },
    { event: 'clerk/organizationMembership.created' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      await step.run('create-organization-user-settings', async () => {
        const userId = event.data.data.public_user_data.user_id;
        const orgId = event.data.data.organization.id;

        await this.drizzle.insertOrganizationUserSettings({
          userId,
          organizationId: orgId,
        });
      });
    },
  );

  clerkDeleteOrgMembership = this.inngest.createFunction(
    {
      id: 'clerk/delete-organization-user-settings',
      name: 'Clerk - Delete Organization User Settings',
    },
    { event: 'clerk/organizationMembership.deleted' },
    async ({ event, step }) => {
      await step.run('verify-webhook', async () => {
        try {
          await this.verifyWebHook({
            raw: event.data.raw,
            headers: event.data.headers,
          });
        } catch {
          throw new NonRetriableError('Invalid webhook');
        }
      });

      await step.run('delete-organization-user-settings', async () => {
        const userId = event.data.data.public_user_data.user_id;
        const orgId = event.data.data.organization.id;

        await this.drizzle.deleteOrganizationUserSettings({
          userId,
          organizationId: orgId,
        });
      });
    },
  );

  prepareDailyUserJobListingNotifications = this.inngest.createFunction(
    {
      id: 'prepare-daily-user-job-listing-notifications',
      name: 'Prepare Daily User Job Listing Notifications',
    },
    {
      cron: 'TZ=Asia/Ho_Chi_Minh 0 7 * * *',
    },
    async ({ step, event }) => {
      const getUsers = step.run('get-users', async () => {
        return this.drizzle.db.query.UserNotificationSettingsTable.findMany({
          where: eq(
            UserNotificationSettingsTable.newJobEmailNotifications,
            true,
          ),
          columns: {
            userId: true,
            newJobEmailNotifications: true,
            aiPrompt: true,
          },
          with: {
            user: {
              columns: {
                email: true,
                name: true,
              },
            },
          },
        });
      });

      const getJobListings = step.run('get-recent-job-listings', async () => {
        return await this.drizzle.db.query.JobListingTable.findMany({
          where: and(
            gte(
              JobListingTable.postedAt,
              subDays(new Date(event.ts ?? Date.now()), 1),
            ),
            eq(JobListingTable.status, 'published'),
          ),
          columns: {
            createdAt: false,
            postedAt: false,
            updatedAt: false,
            status: false,
            organizationId: false,
          },
          with: {
            organization: {
              columns: {
                name: true,
              },
            },
          },
        });
      });

      const [userNotifications, jobListings] = await Promise.all([
        getUsers,
        getJobListings,
      ]);

      if (jobListings.length === 0 || userNotifications.length === 0) return;

      const events = userNotifications.map((notification) => {
        return {
          name: 'app/email.daily-user-job-listings',
          user: {
            email: notification.user.email,
            name: notification.user.name,
          },
          data: {
            aiPrompt: notification.aiPrompt ?? undefined,
            jobListings: jobListings.map((listing) => {
              return {
                ...listing,
                organizationName: listing.organization.name,
              };
            }),
          },
        } as const satisfies GetEvents<
          typeof this.inngest
        >['app/email.daily-user-job-listings'];
      });

      await step.sendEvent('send-emails', events);
    },
  );

  sendDailyUserJobListingEmail = this.inngest.createFunction(
    {
      id: 'send-daily-user-job-listing-email',
      name: 'Send Daily User Job Listing Email',
      throttle: {
        limit: 10,
        period: '1m',
      },
    },
    { event: 'app/email.daily-user-job-listings' },
    async ({ event, step }) => {
      const { jobListings } = event.data;
      const user = event.user;

      if (jobListings.length === 0) return;

      const matchingJobListings = jobListings;

      if (matchingJobListings.length === 0) return;

      await step.run('send-email', async () => {
        await this.resendService.resend.emails.send({
          from: 'Job Board <onboarding@resend.dev>',
          to: user.email,
          subject: 'Daily Job Listings',
          html: this.resendService.buildDailyJobListingEmail(
            user.name,
            jobListings,
            this.config.get('SERVER_URL')!,
          ),
        });
      });
    },
  );
  public inngestHandler(req: Request, res: Response): Promise<void> {
    return serve({
      client: this.inngest,
      functions: [
        this.clerkCreateUser,
        this.clerkUpdateUser,
        this.clerkDeleteUser,
        this.clerkCreateOrganization,
        this.clerkUpdateOrganization,
        this.clerkDeleteOrganization,
        this.sendDailyUserJobListingEmail,
        this.prepareDailyUserJobListingNotifications,
        this.clerkCreateOrgMembership,
        this.clerkDeleteOrgMembership,
      ],
    })(req, res);
  }
}
