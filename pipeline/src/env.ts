import {readEnvOrDie} from '@jvalue/node-dry-basics';

export const CONNECTION_RETRIES = 30;
export const CONNECTION_BACKOFF = 2000;
export const POSTGRES_HOST = 'localhost'; // "adapter-db" //localhost for local
export const POSTGRES_PORT = 5434;
export const POSTGRES_SSL = 'false'
export const POSTGRES_PW = 'pw';
export const POSTGRES_USER = 'pipeline-service';
export const POSTGRES_DB = 'ods-pipelines';
export const POSTGRES_SCHEMA = "public";
export const AMQP_URL = 'amqp://rabbit_adm:R4bb!7_4DM_p4SS@localhost:5672';
export const AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC = 'pipeline.execution.success';
export const AMQP_PIPELINE_EXECUTION_ERROR_TOPIC = 'pipeline.execution.error';
export const AMQP_PIPELINE_CONFIG_CREATED_TOPIC = 'pipeline.config.created';
export const AMQP_PIPELINE_CONFIG_UPDATED_TOPIC = 'pipeline.config.updated';
export const AMQP_PIPELINE_CONFIG_DELETED_TOPIC = 'pipeline.config.deleted';
export const AMQP_DATASOURCE_EXECUTION_EXCHANGE = 'ods_global';
export const AMQP_DATASOURCE_EXECUTION_QUEUE = 'pipeline.datasource-execution';
export const AMQP_DATASOURCE_EXECUTION_QUEUE_TOPIC = 'datasource.execution.success';
export const AMQP_DATASOURCE_EXECUTION_SUCCESS_TOPIC = 'datasource.execution.success';


// export const CONNECTION_RETRIES = +readEnvOrDie('CONNECTION_RETRIES');
// export const CONNECTION_BACKOFF = +readEnvOrDie('CONNECTION_BACKOFF_IN_MS');
// export const POSTGRES_HOST = readEnvOrDie('POSTGRES_HOST');
// export const POSTGRES_PORT = +readEnvOrDie('POSTGRES_PORT');
// export const POSTGRES_USER = readEnvOrDie('POSTGRES_USER');
// export const POSTGRES_PW = readEnvOrDie('POSTGRES_PW');
// // export const POSTGRES_DB = readEnvOrDie('POSTGRES_DB');
// export const POSTGRES_SCHEMA = readEnvOrDie('POSTGRES_SCHEMA');
// export const POSTGRES_SSL =
//   readEnvOrDie('POSTGRES_SSL').toLowerCase() === 'true';

// export const AMQP_URL = readEnvOrDie('AMQP_URL');

// export const AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC = readEnvOrDie(
//   'AMQP_PIPELINE_EXECUTION_SUCCESS_TOPIC',
// );

