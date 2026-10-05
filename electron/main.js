const { app, BrowserWindow, dialog } = require('electron');
const http = require('http');
const net = require('net');
const path = require('path');

let mainWindow;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

function startBackend(port) {
  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(app.getAppPath(), 'backend');
  const backendEntry = path.join(backendDir, 'src', 'server.js');

  process.env.NODE_ENV = 'production';
  process.env.PORT = String(port);
  process.chdir(backendDir);

  require(backendEntry);
}

function waitForBackend(port) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const requestRoot = () => {
      const request = http.get({ hostname: '127.0.0.1', port, path: '/', timeout: 1000 }, (response) => {
        response.resume();
        resolve();
      });
      request.on('error', () => {
        attempts += 1;
        if (attempts >= 50) return reject(new Error('The bundled SuperM server did not start.'));
        setTimeout(requestRoot, 100);
      });
      request.on('timeout', () => request.destroy());
    };
    requestRoot();
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`--superm-api-port=${port}`]
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(process.resourcesPath, 'frontend', 'build', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.superm.desktop');
  }

  findAvailablePort()
    .then(async (port) => {
      startBackend(port);
      await waitForBackend(port);
      createWindow(port);
    })
    .catch((error) => {
      console.error('SuperM startup failed:', error);
      dialog.showErrorBox('SuperM could not start', error.message);
      app.quit();
    });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
