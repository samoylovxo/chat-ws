import { ChatApp } from './components/ChatApp';

const chatApp = new ChatApp('.app', 'http://localhost:7000');
window.chatApp = chatApp;
