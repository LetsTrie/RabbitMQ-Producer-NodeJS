const express = require('express');

const app = express();

require('dotenv').config();

const { produceQueueMessage } = require('./services/queue');

app.get('/produce', async (req, res) => {
  try {
    await produceQueueMessage('task-queue', 'Message-1');
    await produceQueueMessage('task-queue', 'Message-2');
    res.status(200).send('Messages sent to queue');
  } catch (error) {
    res.status(500).send(`Failed to produce messages: ${error}`);
  }
});

const port = process.env.PORT || 4044;
app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
