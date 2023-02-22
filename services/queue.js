const amqp = require('amqplib');

class Queue {
  constructor(queueName, options) {
    this.queueName = queueName;
    this.options = options;
    this.connection = null;
    this.channel = null;
    this.queue = null;
  }

  async create() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      this.queue = await this.channel.assertQueue(this.queueName, this.options);
      console.log(`Connected to queue: ${this.queue.queue}`);
    } catch (error) {
      console.error(`Failed to connect to queue ${this.queueName}: ${error.stack}`);
      throw error;
    }
  }

  async send(message) {
    try {
      message = message.toString();
      await this.channel.sendToQueue(this.queue.queue, Buffer.from(message), {
        persistent: true,
      });
      console.log(`Sent message to queue ${this.queue.queue}: ${message}`);
    } catch (error) {
      console.error(`Failed to send message to queue ${this.queueName}: ${error.stack}`);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log(`Closed connection to queue ${this.queue.queue}`);
    } catch (error) {
      console.error(`Failed to close connection to queue ${this.queueName}: ${error.stack}`);
      throw error;
    }
  }
}

async function produceQueueMessage(queueName, message) {
  const queue = new Queue(queueName, { durable: true });
  try {
    await queue.create();
    await queue.send(message);
  } catch (error) {
    console.error(error.stack);
  } finally {
    await queue.close();
  }
}

module.exports = { produceQueueMessage };
