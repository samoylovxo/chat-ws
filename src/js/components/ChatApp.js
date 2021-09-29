/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

import { Api } from './Api';

export class ChatApp {
  constructor(element, url) {
    // Props
    if (typeof element === 'string') {
      this.element = document.querySelector(element);
    }
    this.api = new Api(url);
    this.ws = new WebSocket('wss://chat-ws-serverside.herokuapp.com/ws');
    this.you = null;

    // Elements
    this.loginElement = this.element.querySelector('.login');
    this.formLogin = this.loginElement.querySelector('.login__form');
    this.inputLogin = this.loginElement.querySelector('.login__input');
    this.error = this.loginElement.querySelector('.login__error');

    this.chatElement = this.element.querySelector('.chat');
    this.formChat = this.chatElement.querySelector('.chat__form');
    this.inputChat = this.chatElement.querySelector('.chat__input');
    this.messageList = this.chatElement.querySelector('.chat__messages-list');
    this.btnLogout = this.chatElement.querySelector('.chat__logout');
    this.usersList = this.chatElement.querySelector('.chat__users');

    // Binds
    this.getUsersData = this.getUsersData.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.validate = this.validate.bind(this);
    this.loggedIn = this.loggedIn.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sync = this.sync.bind(this);
    this.renderUsers = this.renderUsers.bind(this);
    this.renderMessages = this.renderMessages.bind(this);

    // Listeners
    this.formLogin.addEventListener('submit', this.login);
    this.inputLogin.addEventListener('input', this.validate);

    this.formChat.addEventListener('submit', this.sendMessage);
    this.btnLogout.addEventListener('click', this.logout);

    this.ws.addEventListener('message', this.sync);
  }

  async getUsersData() {
    try {
      const response = await this.api.getUsers();
      const json = await response.json();
      return json;
    } catch (err) {
      console.error('Что то пошло не так(');
      return { users: [], status: false, message: err.message };
    }
  }

  async getMessagesData() {
    try {
      const response = await this.api.getChat();
      const json = await response.json();
      return json;
    } catch (err) {
      console.error('Что то пошло не так(');
      return { messages: [], status: false, message: err.message };
    }
  }

  validate(e) {
    const { target } = e;
    if (target.value.trim() !== '') {
      this.error.innerHTML = '';
    }
  }

  login(e) {
    e.preventDefault();

    const data = {
      username: this.inputLogin.value,
    };

    this.api
      .login(data)
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.error.innerHTML = json.message;
        }

        if (json.status === 'ok') {
          this.loggedIn(json.user);
        }
      });

    const user = this.inputLogin.value;
    this.ws.send(JSON.stringify({ user }));

    this.inputLogin.value = '';
  }

  loggedIn(data) {
    this.you = data;

    this.chatElement.classList.remove('hidden');
    this.loginElement.classList.add('hidden');

    this.renderUsers();
    this.renderMessages();
  }

  logout() {
    this.api
      .logoutRemove(this.you.id)
      .then((response) => response.json())
      .then((json) => {
        if (json.status === 'ok') {
          this.ws.send(JSON.stringify({}));
        }
      });

    this.you = null;

    this.chatElement.classList.add('hidden');
    this.loginElement.classList.remove('hidden');
  }

  sendMessage(e) {
    e.preventDefault();

    const message = this.inputChat.value;

    if (message.trim() !== '') {
      this.ws.send(JSON.stringify({ message, user: this.you.name }));
    }

    this.inputChat.value = '';
  }

  sync(e) {
    const { data } = e;
    const wsData = JSON.parse(data);

    if (wsData.type && wsData.type.message) {
      let msgHtml;

      if (this.you.name === wsData.data.user) {
        msgHtml = `<div class="chat__message your">
                      <div>
                        <span>You</span>
                        <span>${wsData.data.time.slice(0, -3)} ${
          wsData.data.date
        }</span>
                      </div>
                      <div>${wsData.data.message}</div>
                    </div>`;
      } else {
        msgHtml = `<div class="chat__message">
                      <div>
                        <span>${wsData.data.user}</span>
                        <span>${wsData.data.time.slice(0, -3)} ${
          wsData.data.date
        }</span>
                      </div>
                      <div>${wsData.data.message}</div>
                    </div>`;
      }

      this.messageList.insertAdjacentHTML('beforeend', msgHtml);

      return;
    }

    if (this.you && wsData.type && wsData.type.user !== this.you.name) {
      const elemUser = `<div class="chat__user">${wsData.data.user}</div>`;

      this.usersList.insertAdjacentHTML('beforeend', elemUser);
    }

    if (wsData.type && Object.keys(wsData.type).length === 0) {
      this.renderUsers();
    }
  }

  async renderUsers() {
    this.usersList.innerHTML = '';

    this.usersData = await this.getUsersData();

    this.usersData.loginUsers.forEach((user) => {
      let userHtml;

      if (this.you && this.you.name === user.name) {
        userHtml = `<div class="chat__user you">You</div>`;
      } else if (user.name) {
        userHtml = `<div class="chat__user">${user.name}</div>`;
      }

      if (userHtml) this.usersList.insertAdjacentHTML('beforeend', userHtml);
    });
  }

  async renderMessages() {
    if (!this.you) return;

    this.messageList.innerHTML = '';

    this.messagesData = await this.getMessagesData();

    this.messagesData.messages.forEach((data) => {
      let msgHtml;

      if (this.you.name === data.user) {
        msgHtml = `<div class="chat__message your">
                      <div>
                        <span>You</span>
                        <span>${data.time.slice(0, -3)} ${data.date}</span>
                      </div>
                      <div>${data.message}</div>
                    </div>`;
      } else {
        msgHtml = `<div class="chat__message">
                      <div>
                        <span>${data.user}</span>
                        <span>${data.time.slice(0, -3)} ${data.date}</span>
                      </div>
                      <div>${data.message}</div>
                    </div>`;
      }

      this.messageList.insertAdjacentHTML('beforeend', msgHtml);
    });
  }
}
