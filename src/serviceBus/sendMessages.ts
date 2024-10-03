import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";
import { Update } from "..";
import { generateUID } from "../../utils/index.js";
import * as dotenv from "dotenv";

dotenv.config();

export default async function sendMessages(updates: Update[]) {
  const messages: ServiceBusMessage[] = updates.map((update, index) => ({
    body: update,
    contentType: "application/json",
    messageId: generateUID(index),
  }));

  const sbClient = new ServiceBusClient(process.env.QUEUE_CONN_STRING || "");
  const sender = sbClient.createSender(process.env.QUEUE_NAME || "");
  let messageBatch = await sender.createMessageBatch();

  for (let message of messages) {
    if (!messageBatch.tryAddMessage(message)) {
      await sender.sendMessages(messageBatch);

      messageBatch = await sender.createMessageBatch();
      if (!messageBatch.tryAddMessage(message)) {
        const err = new Error();
        err.message = "Message too large to send";
        err.name = "message queue";

        throw err;
      }
    }
  }

  await sender.sendMessages(messageBatch);
}
