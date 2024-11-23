import {
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusReceiver,
  ServiceBusSender,
} from "@azure/service-bus";
import { generateUID } from "../../utils";

export default class QueueService<Message> {
  private queueClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;

  constructor(private queueConnString: string, private queueName: string) {
    this.queueClient = new ServiceBusClient(this.queueConnString);
    this.sender = this.queueClient.createSender(this.queueName);
    this.receiver = this.queueClient.createReceiver(this.queueName);
  }

  public async sendMessages(messages: Message[]) {
    const actualMessages: ServiceBusMessage[] = messages.map((message) => ({
      messageId: generateUID(),
      body: message,
      contentType: "application/json",
    }));

    try {
      let batch = await this.sender.createMessageBatch();
      for (let message of actualMessages) {
        if (!batch.tryAddMessage(message)) {
          await this.sender.sendMessages(batch);
          batch = await this.sender.createMessageBatch();
        }
      }

      await this.sender.sendMessages(batch);
    } catch (error) {
      console.error(error);
    }
  }
}
