const Router = require('koa-router');
const uuid = require('uuid');

const router = new Router();
const db = require('../../db');

router.post('/login', async (ctx) => {
  const { body } = ctx.request;
  const thereIsName = db.users.some((user) => user.name === body.username);
  const id = uuid.v4();

  if (thereIsName) {
    ctx.response.body = { status: false, message: 'Имя занято' };
    return;
  }

  db.users.push({ id, name: body.username });

  ctx.response.body = {
    user: { id, name: body.username },
    route: 'login',
    status: 'ok',
  };
});

module.exports = router;
