import { readEnvOrDie } from '@jvalue/node-dry-basics';

export const MAX_TRIGGER_RETRIES = 2;
export const CONNECTION_RETRIES = 20;
export const CONNECTION_BACKOFF_IN_MS = 5000;
export const POSTGRES_HOST = "scheduler-db";
export const POSTGRES_PORT = 5435
export const POSTGRES_USER = "scheduler-service";
export const POSTGRES_PW = "pw";
export const POSTGRES_DB = "ods-schedulers";
export const POSTGRES_SCHEMA = "public";
export const POSTGRES_SSL ="false";
export const ADAPTER_SERVICE_URL = 'http://adapter:8080';
export const AMQP_URL = 'amqp://rabbit_adm:R4bb!7_4DM_p4SS@rabbitmq:5672';
export const AMQP_SCHEDULER_EXCHANGE = 'ods_global';
export const AMQP_SCHEDULER_QUEUE = 'scheduler.datasource-config';
export const AMQP_DATASOURCE_CONFIG_TOPIC = 'datasource.config.*';
export const AMQP_DATASOURCE_CONFIG_CREATED_TOPIC = 'datasource.config.created';
export const AMQP_DATASOURCE_CONFIG_DELETED_TOPIC = 'datasource.config.deleted';
export const AMQP_DATASOURCE_CONFIG_UPDATED_TOPIC = 'datasource.config.updated';
export const AMQP_DATASOURCE_IMPORT_TRIGGER_TOPIC = 'datasource.import-trigger.*'
export const AMQP_DATASOURCE_IMPORT_TRIGGER_CREATED_TOPIC = 'datasource.import-trigger.created';
