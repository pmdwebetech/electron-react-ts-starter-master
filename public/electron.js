const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require('electron'); 
const { PRINT_LABEL_NEEDED } = require('../src/actions/types')
const fs = require('fs');
const { dialog } = require('electron');
const log = require('electron-log');
var wkhtmltoimage = require('wkhtmltoimage');



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

    var html = '<html><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script><body>';

    html += '<img id="barcode"/><br/>';

    //html += "<span><strong>" + data.order_OrderId + "-"+ data.orderPrintJobId +"</strong></span><br/>";

    html += addresssBuilder(data.shipToName);
    html += addresssBuilder(data.shipToAddressLine1);
    html += addresssBuilder(data.shipToAddressLine2);
    html += addresssBuilder(data.shipToTownCity);
    html += addresssBuilder(data.shipToCounty);
    html += addresssBuilder(data.shipToCountry);
    html += addresssBuilder(data.shipToPostCode);

    html += "<br/><span>------------------------------------</span><br/>";

    var orderType = "";

    switch(data.productCategory){
        case productCategory.PhotoPrint:
            orderType = "Prints";
            break;
        case productCategory.PhotoBlock:
            orderType = "Block";
            break;
        case productCategory.CanvasPrint:
            orderType = "Canvas";
            break;
        case productCategoryFramedPrint:
            orderType = "Framed Print";
            break;
        default:
            break;
    }

    html += "<span>" + orderType + " " + "Order Id: " + data.order_OrderId + "-"+ data.orderPrintJobId + "</span><br/>"; 

    var orderItems = [];

    if(data.productCategory === productCategory.PhotoPrint){
        data.orderItems.forEach(orderItem => {

          const existingProduct = orderItems.find(element => element.id === orderItem.printSizeCode.trim());

          if(existingProduct){
            existingProduct.quantity += orderItem.quantity;
          }
          else{
            orderItems.push({id : orderItem.printSizeCode.trim(),  product : "Prints " + orderItem.printSizeCode.trim(), quantity : orderItem.quantity})
          }
        });
    }
    else if(data.productCategory === productCategory.PhotoBlock){

        data.photoBlocks.forEach(orderItem => {

        const existingProduct = orderItems.find(block => block.id === orderItem.size.trim());

        if(existingProduct){
          existingProduct.quantity += orderItem.quantity;
        }
        else{
          orderItems.push({id : orderItem.size.trim(),  product : "Block " + orderItem.size.trim(), quantity : orderItem.quantity})
        }
      });
    }
    else if(data.productCategory === productCategory.CanvasPrint){

        data.canvases.forEach(orderItem => {

        const existingProduct = orderItems.find(canvas => canvas.id === orderItem.size.trim());

        if(existingProduct){
          existingProduct.quantity += orderItem.quantity;
        }
        else{
          orderItems.push({id : orderItem.size.trim(),  product : "Canvas " + orderItem.size.trim(), quantity : orderItem.quantity})
        }
      });
    }
    else if(data.productCategory === productCategory.FramedPrint){

        data.framedPrints.forEach(orderItem => {

        const existingProduct = orderItems.find(frame => frame.id === orderItem.size.trim());

        if(existingProduct){
          existingProduct.quantity += orderItem.quantity;
        }
        else{
          orderItems.push({id : orderItem.size.trim(),  product : "Frame " + orderItem.size.trim(), quantity : orderItem.quantity})
        }
      });
    }

    html += '<table><tr><th align="left">Product</th><th align="right">Quantity</th></tr>';

    orderItems.forEach(item => {
        html += '<tr><td>' + item.product + '</td><td align="right">' + item.quantity + '</td></tr>';
    });

    html += "</table>";

    html += '<br/></body><script>JsBarcode("#barcode", "'+ data.order_OrderId + '-' + data.orderPrintJobId  +'", {height:20});</script></html>';

    var stream = wkhtmltoimage.generate(html, {width : 260})
                    .pipe(fs.createWriteStream(filePath));

    stream.on('finish', function () {
        print(filePath);
    });

});

function addresssBuilder(addressPart) {
    if(addressPart){

        return "<span>" + addressPart + "</span><br/>";
    }
    else{
        return "";
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

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
        setTimeout(function(){
            win.close();
        }, 1000);
    });
    
  }

  var productCategory = {
    PhotoPrint : 0,
    GiftCard : 1,
    PhotoBook : 2,
    CreditPack : 3,
    Unknown : 4,
    GreetingCard : 5,
    PhotoBlock : 6,
    FramedPrint : 7,
    CanvasPrint : 8
};