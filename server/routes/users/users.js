const Router = require('koa-router');

const router = new Router();
const db = require('../../db');

router.get('/users', async (ctx) => {
  ctx.response.body = { loginUsers: db.users, route: 'users', status: 'ok' };
});

router.delete('/delete/:id', async (ctx) => {
  const { params } = ctx;

  const deleteUserIndex = db.users.findIndex((user) => user.id === params.id);
  const deleteUser = db.users.find((user) => user.id === params.id);

  if (deleteUser === -1) {
    ctx.response.body = {
      route: 'delete',
      status: 'false',
    };
    return;
  }

  db.users.splice(deleteUserIndex, 1);

  ctx.response.body = { removeUser: deleteUser, route: 'delete', status: 'ok' };
});

module.exports = router;
