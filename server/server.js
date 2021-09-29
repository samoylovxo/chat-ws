/* eslint-disable no-console */
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');
const router = require('./routes/router');

const app = new Koa();
const db = require('./db');

app.use(koaBody({ urlencoded: true, multipart: true, json: true }));

app.use(cors());

app.use(router());

const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server,
});

wsServer.on('connection', (ws) => {
  const errCallback = (err) => {
    console.log(err);
  };

  ws.on('message', (msg) => {
    const message = new Uint8Array(msg);
    const decoded = JSON.parse(new TextDecoder('utf8').decode(message));
    const date = new Date();

    if (decoded.message) {
      db.messages.push({
        message: decoded.message,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        user: decoded.user,
      });
    }

    Array.from(wsServer.clients)
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) =>
        client.send(
          JSON.stringify({
            data: {
              message: decoded.message,
              date: date.toLocaleDateString(),
              time: date.toLocaleTimeString(),
              user: decoded.user,
            },
            type: decoded,
          })
        )
      );
  });

  ws.send(JSON.stringify(db), errCallback);
});

const port = process.env.PORT || 7070;

server.listen(port);
