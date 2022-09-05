import { Server } from 'http';

import { AmqpConnection } from '@jvalue/node-dry-amqp';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { AdapterEndpoint } from '../../adapter/src/adapter/api/rest/adapterEndpoint';
import { createDataSourceAmqpConsumer } from '../../adapter/src/datasource/api/amqp/amqpConsumer';
import { DataImportEndpoint } from '../../adapter/src/datasource/api/rest/dataImportEndpoint';
import { DataSourceEndpoint } from '../../adapter/src/datasource/api/rest/dataSourceEndpoint';
import { initDatasourceDatabases } from '../../adapter/src/datasource/repository/datasourceDatabase';
import { AMQP_URL, CONNECTION_BACKOFF } from '../../adapter/src/env';
import {initNotificationRepository} from "../../notification/src/notification-config/postgresNotificationRepository";
import VM2SandboxExecutor from "../../notification/src/notification-execution/condition-evaluation/vm2SandboxExecutor";
import NotificationExecutor from "../../notification/src/notification-execution/notificationExecutor";
import {TriggerEventHandler} from "../../notification/src/api/triggerEventHandler";
import {NotificationConfigEndpoint} from "../../notification/src/api/rest/notificationConfigEndpoint";
import {NotificationExecutionEndpoint} from "../../notification/src/api/rest/notificationExecutionEndpoint";
import {createPipelineSuccessConsumer} from "../../notification/src/api/amqp/pipelineSuccessConsumer";
import {PipelineExecutionEndpoint} from "../../pipeline/src/api/rest/pipelineExecutionEndpoint";
import {PipelineConfigEndpoint} from "../../pipeline/src/api/rest/pipelineConfigEndpoint";
import {PipelineTranformedDataEndpoint} from "../../pipeline/src/api/rest/pipelineTransformedDataEndpoint";
import PipelineExecutor from "../../pipeline/src/pipeline-execution/pipelineExecutor";
import {PipelineConfigManager} from "../../pipeline/src/pipeline-config/pipelineConfigManager";
import {PipelineTransformedDataManager} from "../../pipeline/src/pipeline-config/pipelineTransformedDataManager";
import {init as initDatabase} from "../../pipeline/src/pipeline-config/pipelineDatabase";
import JsonSchemaValidator from "../../pipeline/src/pipeline-validator/jsonSchemaValidator";
import SecondVM2SandboxExecutor  from "../../pipeline/src/pipeline-execution/sandbox/secondVM2SandboxExecutor";
import Scheduler from "../../scheduler/src/scheduling";
import {CONNECTION_BACKOFF_IN_MS, MAX_TRIGGER_RETRIES} from "../../scheduler/src/env";
import {DatasourceConfigConsumer} from "../../scheduler/src/api/amqp/datasourceConfigConsumer";
import {setupInitialStateWithRetry} from "../../scheduler/src/initializer";
import { PostgresStorageContentRepository } from '../../storage/storage-mq/src/storage-content/postgresStorageContentRepository';
import { PostgresStorageStructureRepository } from '../../storage/storage-mq/src/storage-structure/postgresStorageStructureRepository';
import { createPipelineConfigEventConsumer } from '../../storage/storage-mq/src/api/amqp/pipelineConfigConsumer';
import { createPipelineExecutionEventConsumer } from '../../storage/storage-mq/src/api/amqp/pipelineExecutionConsumer';
import { PipelineConfigEventHandler } from '../../storage/storage-mq/src/api/pipelineConfigEventHandler';
import { PipelineExecutionEventHandler } from '../../storage/storage-mq/src/api/pipelineExecutionEventHandler';
import { StorageContentEndpoint } from '../../storage/storage-mq/src/api/rest/storageContentEndpoint';
import { PostgresClient } from '@jvalue/node-dry-pg';
import { PoolConfig } from 'pg';
import { Console } from 'console';
import { getSystemErrorName } from 'util';

export const port = 8080;
export let server: Server | undefined;
let scheduler: Scheduler | undefined;
async function main(): Promise<void> {
  const notificationRepository = await initNotificationRepository(
    30,
    CONNECTION_BACKOFF,
  );
  const postgresClient = await initDatabase(
    30,
    CONNECTION_BACKOFF,
  );
  // Pool Config Storage Service
  const POOL_CONFIG: PoolConfig = {
    host: "localhost",
    port: 5436,
    user: "ods_admin",
    password: "ods_pw",
    database: "ods",
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  const sandboxExecutor = new VM2SandboxExecutor();
  const sandboxExecutor2 = new SecondVM2SandboxExecutor();
  const validator = new JsonSchemaValidator();
  const pipelineTransformedDataManager = new PipelineTransformedDataManager(
    postgresClient,
  );
  const pipelineExecutor = new PipelineExecutor(sandboxExecutor2);
  const pipelineConfigManager = new PipelineConfigManager(
    postgresClient,
    pipelineExecutor,
    pipelineTransformedDataManager,
    validator,
  );
  const notificationExecutor = new NotificationExecutor(sandboxExecutor);
  const triggerEventHandler = new TriggerEventHandler(
    notificationRepository,
    notificationExecutor,
  );
  const notificationConfigEndpoint = new NotificationConfigEndpoint(
    notificationRepository,
  );
  const notificationExecutionEndpoint = new NotificationExecutionEndpoint(
    triggerEventHandler,
  );
  const pipelineExecutionEndpoint = new PipelineExecutionEndpoint(
    pipelineExecutor,
  );
  const pipelineConfigEndpoint = new PipelineConfigEndpoint(
    pipelineConfigManager,
  );
  const pipelineTransformedDataEndpoint = new PipelineTranformedDataEndpoint(
    pipelineTransformedDataManager,
  );

  const postgresClient2 = new PostgresClient(POOL_CONFIG);

  const storageContentRepository = new PostgresStorageContentRepository(
    postgresClient2,
  );
  const storageStructureRepository = new PostgresStorageStructureRepository(
    postgresClient2,
  );
  console.log("Cont" + storageContentRepository)
  console.log("Struc" + storageStructureRepository)
  
  const pipelineConfigEventHandler = new PipelineConfigEventHandler(
    storageStructureRepository,
  );
  const pipelineExecutionEventHandler = new PipelineExecutionEventHandler(
    storageContentRepository,
  );


  const amqpConnection = new AmqpConnection(
    AMQP_URL,
    30,
    CONNECTION_BACKOFF,
    onAmqpConnectionLoss,
    // "amqp://rabbit_adm:R4bb!7_4DM_p4SS@localhost:5672",
    // 30,
    // 2000,
    // OnAmqpConnectionLoss
  );
  await createPipelineSuccessConsumer(amqpConnection, triggerEventHandler);
  scheduler = new Scheduler(postgresClient, MAX_TRIGGER_RETRIES);
  const datasourceConfigConsumer = new DatasourceConfigConsumer(
    amqpConnection,
    scheduler,
  );
  await datasourceConfigConsumer.initialize();

  await setupInitialStateWithRetry(
    scheduler,
    30,
    CONNECTION_BACKOFF_IN_MS,
  );

  await datasourceConfigConsumer.startEventConsumption();
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  notificationConfigEndpoint.registerRoutes(app);
  notificationExecutionEndpoint.registerRoutes(app);


  pipelineExecutionEndpoint.registerRoutes(app);
  pipelineConfigEndpoint.registerRoutes(app);
  pipelineTransformedDataEndpoint.registerRoutes(app);

  await createPipelineConfigEventConsumer(
      amqpConnection,
      pipelineConfigEventHandler,
  )

  await createPipelineExecutionEventConsumer(
      amqpConnection,
      pipelineExecutionEventHandler,
  )

  const storageContentEndpoint = new StorageContentEndpoint(
    storageContentRepository,
  );
  storageContentEndpoint.registerRoutes(app);

  app.get('/version', (req: express.Request, res: express.Response): void => {
    res.header('Content-Type', 'text/plain');
    res.send(notificationExecutor.getVersion());
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
  app.get('/', (req: express.Request, res: express.Response): void => {
    res.status(200).send('I am alive!');
  });



  await initDatasourceDatabases(30, CONNECTION_BACKOFF);


  await createDataSourceAmqpConsumer(amqpConnection);

  const adapterEndpoint = new AdapterEndpoint();
  adapterEndpoint.registerRoutes(app);
  const dataSourceEndpoint = new DataSourceEndpoint();
  dataSourceEndpoint.registerRoutes(app);
  const dataImportEndpoint = new DataImportEndpoint();
  dataImportEndpoint.registerRoutes(app);

}

main().catch((error: unknown) => {
  console.error(`Failed to start adapter service: `, error);
});
function onAmqpConnectionLoss(error: unknown): never {
  console.log('Terminating because connection to AMQP lost:', error);
  process.exit(1);
}
