const { contextBridge } = require('electron');

const portArgument = process.argv.find((argument) => argument.startsWith('--superm-api-port='));
const port = Number(portArgument?.split('=')[1]);
const apiBaseUrl = Number.isInteger(port) && port > 0 && port <= 65535
  ? `http://127.0.0.1:${port}`
  : 'http://localhost:5000';

contextBridge.exposeInMainWorld('supermDesktop', { apiBaseUrl });