import { Update } from "../../src/index.js";
import QueueService from "./index.js";

class PartialUpdateQService extends QueueService<Update> {
  constructor(queueConnString: string, queueName: string) {
    super(queueConnString, queueName);
  }
}

export default new PartialUpdateQService(
  process.env.PARTIAL_UPDATE_QUEUE_CONN_STRING as string,
  process.env.PARTIAL_UPDATE_QUEUE_NAME as string
);
