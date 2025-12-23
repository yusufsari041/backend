const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.min(1600, width * 0.9),
    height: Math.min(1000, height * 0.9),
    minWidth: 1200,
    minHeight: 700,
    x: Math.floor((width - Math.min(1600, width * 0.9)) / 2),
    y: Math.floor((height - Math.min(1000, height * 0.9)) / 2),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      devTools: true, // Developer Tools'u açık tut
      // Electron'u userAgent'a ekle
      userAgent: 'Electron/' + process.versions.electron + ' ' + (process.env.USER_AGENT || ''),
    },
    icon: path.join(__dirname, '../assets/logo/icon.png'),
    autoHideMenuBar: false, // Menu bar'ı göster (F12 için)
    title: 'Sarı İletişim Takip Programı',
    backgroundColor: '#FFA500',
    show: false,
    frame: true,
    titleBarStyle: 'default',
  });
  
  // Developer Tools'u otomatik aç (DEBUG MODU)
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
    console.log('🔧 DEBUG MODU: Developer Tools açıldı');
  }
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Electron penceresi gösterildi');
  });
  
  // Console log'larını yakala ve göster
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelName = ['', 'INFO', 'WARNING', 'ERROR'][level] || 'LOG';
    console.log(`[${levelName}] ${message} (${sourceId}:${line})`);
  });
  
  // Hataları yakala
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Sayfa yüklenemedi:', errorCode, errorDescription, validatedURL);
  });
  
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('💥 Renderer process çöktü!', killed);
  });

  // Menu bar'ı göster (F12 için)
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  if (isDev) {
    // Vite dev server'ın başlamasını bekle
    const waitForVite = () => {
      const tryPorts = [5173, 5174, 5175, 5176, 5177];
      let currentPort = 0;
      const tryLoad = () => {
        if (currentPort >= tryPorts.length) {
          console.error('❌ Vite dev server bulunamadi! 5 saniye sonra tekrar deneniyor...');
          setTimeout(waitForVite, 5000);
          return;
        }
        const port = tryPorts[currentPort];
        const http = require('http');
        const req = http.get(`http://localhost:${port}`, (res) => {
          console.log(`✅ Vite dev server bulundu: http://localhost:${port}`);
          mainWindow.loadURL(`http://localhost:${port}`);
        });
        req.on('error', () => {
          currentPort++;
          tryLoad();
        });
        req.setTimeout(1000, () => {
          req.destroy();
          currentPort++;
          tryLoad();
        });
      };
      tryLoad();
    };
    
    // İlk deneme 3 saniye sonra
    setTimeout(waitForVite, 3000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    const http = require('http');
    const checkBackend = () => {
      const req = http.get('http://localhost:3001', (res) => {
        console.log('Backend zaten calisiyor');
      });
      req.on('error', () => {
        console.log('Backend baslatiliyor...');
        backendProcess = spawn('npm', ['run', 'start:dev'], {
          cwd: path.join(__dirname, '../../backend'),
          shell: true,
        });

        backendProcess.stdout.on('data', (data) => {
          console.log(`Backend: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
          console.error(`Backend Error: ${data}`);
        });
      });
    };
    checkBackend();
  } else {
    const resourcesPath = process.resourcesPath || app.getAppPath();
    const backendPath = path.join(resourcesPath, 'backend', 'main.js');
    const backendCwd = path.join(resourcesPath, 'backend');
    
    backendProcess = spawn('node', [backendPath], {
      cwd: backendCwd,
      shell: true,
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });
  }
}

app.whenReady().then(() => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Content Security Policy ayarları
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Development modunda Vite HMR için unsafe-eval gerekebilir
    // Production'da daha sıkı bir CSP kullanıyoruz, ancak Render.com backend'e bağlantı için izin veriyoruz
    const csp = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; font-src 'self' data:; connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://backend-x49x.onrender.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';";
    
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });
  
  // Development modunda lokal backend başlat, production'da Render.com backend kullan
  if (isDev) {
    startBackend();
  }
  // Production'da Render.com backend kullanıldığı için lokal backend başlatmaya gerek yok
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

