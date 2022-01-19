const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require('electron'); 
const { PRINT_LABEL_NEEDED } = require('../src/actions/types')
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs');
const { dialog } = require('electron');
const log = require('electron-log');



let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 900, 
        height: 680,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: __dirname + '/preload.js'
          }
    });
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow = null));
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on(PRINT_LABEL_NEEDED, (event , data) => {
    log.info("PRINT_LABEL_NEEDED");

    var filePath = path.join(app.getPath("temp"), "image.png");

    log.info(filePath);

    if (!fs.existsSync(app.getPath("temp"))) {
        log.info("Directory does not exists.");

        fs.mkdir(app.getPath("temp"), function (err) {
        if (err) {
            log.error(err.message);
            dialog.showErrorBox('Failed to create directory\n', err.message);
        } else {
            log.info("Calling htmtl-to-image.");
            nodeHtmlToImage({
                output: filePath,
                html: '<html><body>Hello world!</body></html>'
              }).then((a, b) => {
                log.info('The image was created successfully!');
                print(filePath);
            });
    
            print(x);
        }
        });
    }
    else{
        log.info("Calling htmtl-to-image.");
        try
        {
            nodeHtmlToImage({
                output: filePath,
                html: '<html><body>Hello world!</body></html>'
            }).then((a, b) => {
                log.info('The image was created successfully!');
                print(filePath);
            });

            var d = "";
        }
        catch(error){
            log.error(error);
        }
    }

    
});

function print(file){
    log.info("Calling print.");
    let win = new BrowserWindow({show: false})
    log.error("loading file to print");
    win.loadURL("file://" + file)
    win.webContents.on('did-finish-load', () => {
        win.webContents.print({silent:true}, function (success,failure) {
            if(!success){
                log.error(failure);
                dialog.showErrorBox('Failed to print\n', failure);
            }
            else{
                log.info("Sent to printer");
            }
        })
        // setTimeout(function(){
        //     win.close();
        // }, 1000);
    });
    
  }