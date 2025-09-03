import { Inngest } from 'inngest';
import { serve } from 'inngest/express';

// Create a client to send and receive events
export const inngest = new Inngest({ id: 'work-hive' });

// Create an empty array where we'll export future Inngest functions
export const functions = [];

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const inngestHandler: (req: Request, res: Response) => Promise<void> =
  serve({
    client: inngest,
    functions,
  });
