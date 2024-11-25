import {
  ReceiveMessagesOptions,
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
  ServiceBusSender,
} from "@azure/service-bus";
import { generateUID } from "../../utils/index.js";

export default class QueueService<Message> {
  private queueClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;
  private static queueClients: ServiceBusClient[] = [];

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
  public async recieveMessages(
    count: number,
    receiveMode: "peekLock" | "receiveAndDelete",
    options?: ReceiveMessagesOptions
  ) {
    this.receiver.receiveMode = receiveMode;
    return await this.receiver.receiveMessages(count, options);
  }

  public async completeMessage(message: ServiceBusReceivedMessage) {
    await this.receiver.completeMessage(message);
  }

  public async closeClient() {
    await this.queueClient.close();
  }

  public static async closeAllClients() {
    for (let client of QueueService.queueClients) {
      await client.close();
    }
  }
}
