import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
  },
  emptyStringAsUndefined: true,
  createFinalSchema: (shape) =>
    z.object(shape).transform((env) => {
      return {
        ...env,
        DB_URL: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
      };
    }),
  runtimeEnv: process.env,
});
