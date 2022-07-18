import { PostgresClient } from '@jvalue/node-dry-pg';
import { PoolConfig } from 'pg';

import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_PW,
  POSTGRES_USER,
} from '../../env';

import { createDataImportTable } from './dataImportRepository';

const POOL_CONFIG: PoolConfig = {
  host: "localhost",
  port: 5432 as number,
  user: "adapterservice",
  password: "admin",
  database: "adapterservice",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export async function initDataImportDatabase(
  retries: number,
  backoffMs: number,
): Promise<PostgresClient> {
  const postgresClient = new PostgresClient(POOL_CONFIG);
  await postgresClient.waitForConnection(retries, backoffMs);
  await postgresClient.transaction(async (client) => {
    await createDataImportTable(client);
  });
  return postgresClient;
}
