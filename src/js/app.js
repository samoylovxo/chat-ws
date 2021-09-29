import { ChatApp } from './components/ChatApp';

const chatApp = new ChatApp('.app', 'https://chat-ws-serverside.herokuapp.com');
window.chatApp = chatApp;
