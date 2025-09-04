// import { DeletedObjectJSON, UserJSON } from '@clerk/backend';
// import { EventSchemas, Inngest } from 'inngest';
// import { serve } from 'inngest/express';
// import { clerkCreateUser } from 'services/inngest/functions/clerk';

// type ClerkWebhookData<T> = {
//   data: {
//     data: T;
//     raw: string;
//     headers: Record<string, string>;
//   };
// };

// type Events = {
//   'clerk/user.created': ClerkWebhookData<UserJSON>;
//   'clerk/user.updated': ClerkWebhookData<UserJSON>;
//   'clerk/user.deleted': ClerkWebhookData<DeletedObjectJSON>;
// };

// export const inngest = new Inngest({
//   id: 'work-hive',
//   schemas: new EventSchemas().fromRecord<Events>(),
// });

// export const functions = [clerkCreateUser];

// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// export const inngestHandler: (req: Request, res: Response) => Promise<void> =
//   serve({
//     client: inngest,
//     functions,
//   });
