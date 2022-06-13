import { readEnvOrDie } from '@jvalue/node-dry-basics';
//
// export const CONNECTION_RETRIES = +readEnvOrDie('CONNECTION_RETRIES');
// export const CONNECTION_BACKOFF = +readEnvOrDie('CONNECTION_BACKOFF_IN_MS');
//
// export const POSTGRES_HOST = readEnvOrDie('POSTGRES_HOST');
// export const POSTGRES_PORT = +readEnvOrDie('POSTGRES_PORT');
// export const POSTGRES_USER = readEnvOrDie('POSTGRES_USER');
// export const POSTGRES_PW = readEnvOrDie('POSTGRES_PW');
// export const POSTGRES_DB = readEnvOrDie('POSTGRES_DB');
// export const POSTGRES_SSL =
//   readEnvOrDie('POSTGRES_SSL').toLowerCase() === 'true';
//
// export const AMQP_URL = readEnvOrDie('AMQP_URL');
// export const AMQP_PIPELINE_EXECUTION_EXCHANGE = readEnvOrDie(
//   'AMQP_PIPELINE_EXECUTION_EXCHANGE',
// );
// export const AMQP_PIPELINE_EXECUTION_QUEUE = readEnvOrDie(
//   'AMQP_PIPELINE_EXECUTION_QUEUE',
// );
// export const AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC = readEnvOrDie(
//   'AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC',
// );

export const CONNECTION_RETRIES = 30;
export const CONNECTION_BACKOFF = 2000;
export const POSTGRES_HOST = 'localhost'; // "adapter-db" //localhost for local
export const POSTGRES_PORT = 5433;
export const POSTGRES_SSL= 'false'
export const POSTGRES_PW = 'admin';
export const POSTGRES_USER = 'notification_usr';
export const POSTGRES_DB = 'ods-notifications';
export const AMQP_URL = 'amqp://rabbit_adm:R4bb!7_4DM_p4SS@localhost:5672';
export const AMQP_PIPELINE_EXECUTION_EXCHANGE = 'ods_global';
export const AMQP_PIPELINE_EXECUTION_QUEUE = 'notification.pipeline-execution';
export const AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC =
  'pipeline.execution.success';
