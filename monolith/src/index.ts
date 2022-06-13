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
import { AMQP_URL, CONNECTION_BACKOFF, CONNECTION_RETRIES } from '../../adapter/src/env';
import {initNotificationRepository} from "../../notification/src/notification-config/postgresNotificationRepository";
import VM2SandboxExecutor from "../../notification/src/notification-execution/condition-evaluation/vm2SandboxExecutor";
import NotificationExecutor from "../../notification/src/notification-execution/notificationExecutor";
import {TriggerEventHandler} from "../../notification/src/api/triggerEventHandler";
import {NotificationConfigEndpoint} from "../../notification/src/api/rest/notificationConfigEndpoint";
import {NotificationExecutionEndpoint} from "../../notification/src/api/rest/notificationExecutionEndpoint";
import {createPipelineSuccessConsumer} from "../../notification/src/api/amqp/pipelineSuccessConsumer";

export const port = 8080;
export let server: Server | undefined;

async function main(): Promise<void> {
  const notificationRepository = await initNotificationRepository(
    CONNECTION_RETRIES,
    CONNECTION_BACKOFF,
  );
  const sandboxExecutor = new VM2SandboxExecutor();
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
  const amqpConnection = new AmqpConnection(
    AMQP_URL,
    CONNECTION_RETRIES,
    CONNECTION_BACKOFF,
    onAmqpConnectionLoss,
    // "amqp://rabbit_adm:R4bb!7_4DM_p4SS@localhost:5672",
    // 30,
    // 2000,
    // OnAmqpConnectionLoss
  );
  await createPipelineSuccessConsumer(amqpConnection, triggerEventHandler);
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  notificationConfigEndpoint.registerRoutes(app);
  notificationExecutionEndpoint.registerRoutes(app);
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

  await initDatasourceDatabases(CONNECTION_RETRIES, CONNECTION_BACKOFF);


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
