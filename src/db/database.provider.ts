import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema';

export const DB_POOL = 'DB_POOL';
export const DB_CONNECTION = 'DB_CONNECTION';

export const databaseProviders: Provider[] = [
  {
    provide: DB_POOL,
    useFactory: () => {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      const poolConfig: PoolConfig = { connectionString };
      return new Pool(poolConfig);
    },
  },
  {
    provide: DB_CONNECTION,
    useFactory: (pool: Pool) => drizzle(pool, { schema }),
    inject: [DB_POOL],
  },
];
