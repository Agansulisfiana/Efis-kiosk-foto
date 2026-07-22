// electron/main.js
// Menjalankan index.html sebagai aplikasi kiosk fullscreen 1280x1024,
// dan menyediakan cetak SENYAP (tanpa dialog Windows) ke printer Fargo.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// >>> GANTI dengan nama printer Fargo persis seperti di "Devices and Printers" Windows
const PRINTER_NAME = 'Fargo HDP5600 Card Printer';

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 1024,
    fullscreen: true,      // set false saat development supaya gampang buka DevTools
    kiosk: true,            // kunci total: tidak bisa alt-tab / close biasa
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Uncomment untuk debug:
  // win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- Cetak senyap dipicu dari halaman web lewat window.print() ----
// Electron otomatis menangkap window.print() dan bisa dikonfigurasi silent
// lewat webContents.print() sebagai gantinya. Kalau kamu ingin 100% tanpa
// dialog SAMA SEKALI, ganti pemanggilan window.print() di app.js dengan
// mengirim IPC ke sini, lalu panggil silentPrint() di bawah.
ipcMain.handle('silent-print', async () => {
  return new Promise((resolve) => {
    win.webContents.print(
      {
        silent: true,
        printBackground: true,
        deviceName: PRINTER_NAME,
        margins: { marginType: 'none' },
        pageSize: {
          // Electron pakai microns: CR80 = 53.98mm x 85.60mm
          width: 53980,
          height: 85600,
        },
      },
      (success, errorType) => resolve({ success, errorType })
    );
  });
});

// ---- Keluar aplikasi (dipanggil dari tombol "Keluar") ----
ipcMain.handle('exit-app', () => app.quit());
