import { Injectable } from '@nestjs/common';
import { DeletedObjectJSON, OrganizationJSON, UserJSON } from '@clerk/backend';
import { EventSchemas, Inngest } from 'inngest';
import { serve } from 'inngest/express';
import { NonRetriableError } from 'inngest';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from 'src/drizzle/drizzle.service';

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
};

@Injectable()
export class InngestService {
  constructor(
    private config: ConfigService,
    private drizzle: DrizzleService,
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
      ],
    })(req, res);
  }
}
