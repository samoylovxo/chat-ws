const combineRouters = require('koa-combine-routers');

const loginRouter = require('./login/login');
const chatRouter = require('./chat/chat');
const usersRouter = require('./users/users');

const router = combineRouters(loginRouter, chatRouter, usersRouter);

module.exports = router;
