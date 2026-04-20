const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // send first message
  ws.send(JSON.stringify({ type: 'ping', message: 'Hello client' }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    console.log('From client:', data);

    // respond back
    ws.send(JSON.stringify({
      type: 'ping',
      message: 'Server responding again'
    }));
  });
});