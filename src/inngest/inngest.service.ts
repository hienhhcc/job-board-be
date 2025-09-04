import { Injectable } from '@nestjs/common';
import { DeletedObjectJSON, UserJSON } from '@clerk/backend';
import { EventSchemas, Inngest } from 'inngest';
import { serve } from 'inngest/express';
import { NonRetriableError } from 'inngest';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from 'src/drizzle/drizzle.service';
// import { insertUser } from 'features/users/db/users';
// import { insertUserNotificationSettings } from 'features/users/db/userNotificationSettings';

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
};

@Injectable()
export class InngestService {
  constructor(
    private config: ConfigService,
    private drizzle: DrizzleService,
  ) {}

  private inngest = new Inngest({
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

  public inngestHandler(req: Request, res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return serve({
      client: this.inngest,
      functions: [this.clerkCreateUser],
    })(req, res);
  }
}
