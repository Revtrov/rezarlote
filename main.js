const electron = require('electron'),
    app = require('electron').app,
    BrowserWindow = require('electron').BrowserWindow,
    ipc = electron.ipcMain,
    dialog = electron.dialog,
    path = require('path');

let mainWindow, settingsWindow;

app.on('window-all-closed', () => {
    if (process.platform != 'darwin')
        app.quit();
});

ipc.on('minimize', (event) => {
    mainWindow.minimize();
})
ipc.on('maximize', (event) => {
    if (!mainWindow.isMaximized()) {
        mainWindow.maximize();
    } else {
        mainWindow.unmaximize();
    }
})
ipc.on('close', (event) => {
    mainWindow.close();
})

ipc.on('minimizeSettings', (event) => {
    settingsWindow.minimize();
})
ipc.on('maximizeSettings', (event) => {
    if (!settingsWindow.isMaximized()) {
        settingsWindow.maximize();
    } else {
        settingsWindow.unmaximize();
    }
})
ipc.on('closeSettings', (event) => {
    settingsWindow.close();
})

ipc.on('settingsUpdate', (event) => {
    mainWindow.webContents.send('settingsUpdate')
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 225,
        minHeight: 39,
        frame: false,
        icon: path.join(__dirname, 'unnamed.ico'),
        webPreferences: {
            preload: path.join(__dirname, '/js/mainWindowJs.js'),
        }
    });
    mainWindow.maximize()
    mainWindow.loadURL(`file://${__dirname}/html/mainWindow.html`);
    const createSettingsWindow = () => {
        settingsWindow = new BrowserWindow({
            width: 350,
            resizable: true,
            minWidth: 325,
            minHeight: 39,
            height: 600,
            frame: false,
            icon: path.join(__dirname, 'unnamed.ico'),
            webPreferences: {
                preload: path.join(__dirname, '/js/settingsWindowJs.js'),
            }
        });
        settingsWindow.loadURL(`file://${__dirname}/html/settingsWindow.html`);
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        })
    }
    ipc.on('openFolder', (event) => {
        files = dialog.showOpenDialogSync(mainWindow, {
            properties: ['openDirectory']
        })
        mainWindow.webContents.send('selected-file', files)
    })
    ipc.on('getFile', (event) => {
        files = dialog.showOpenDialogSync(mainWindow, {
            properties: ['openFile']
        })
        mainWindow.webContents.send('selected-CSS', files);
        settingsWindow.webContents.send('selected-CSS', files);
    });
    ipc.on('openSettings', (event) => {
        setTimeout(() => {
            if (settingsWindow == undefined) {
                createSettingsWindow();
            } else {
                settingsWindow.focus();
            }
        }, 100)
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (settingsWindow != null) {
            settingsWindow.close();
            settingsWindow = null
        }
    });
});