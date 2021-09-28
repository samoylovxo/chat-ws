const Router = require('koa-router');

const router = new Router();
const db = require('../../db');

router.get('/chat', async (ctx) => {
  ctx.response.body = { messages: db.messages, route: 'chat', status: 'ok' };
});

module.exports = router;
