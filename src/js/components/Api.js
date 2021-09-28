/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

export class Api {
  constructor(url) {
    this.url = url;
    this.contentTypeHeader = { 'Content-Type': 'application/json' };
  }

  getUsers() {
    return fetch(`${this.url}/users`);
  }

  login(data) {
    return fetch(`${this.url}/login`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.contentTypeHeader,
    });
  }

  getChat() {
    return fetch(`${this.url}/chat`);
  }

  logoutRemove(id) {
    return fetch(`${this.url}/delete/${id}`, {
      method: 'DELETE',
    });
  }
}
