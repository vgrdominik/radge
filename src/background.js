'use strict'

import { ipcMain, app, protocol, BrowserWindow } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, frame: false, webPreferences: {
    nodeIntegration: true
  } })
  win.setMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })

  win.maximize()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// OWN CODE

const fs = require('fs')

ipcMain.on('install', function () {
  let playContent = 'Instalando screen'

  const execFile = require('child_process').execFile
  let args = [
      app.getAppPath() + '/../src/screen/project.godot',
      '--export', 'Windows Desktop', app.getAppPath() + '/../src/screenPack/radge_screen.exe'
  ]
  execFile(app.getAppPath() + '/../src/godot3_2.exe', args, (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr)
      throw error
    }

    checkIsInstalled()
    console.log('stdout', stdout)
  });

  win.webContents.send('running_install', playContent)
})

// Only to WPF developers
// Needed msbuild command installed
ipcMain.on('install_manager', function () {
  let playContent = 'Instalando screen manager'

  const execFile = require('child_process').execFile
  let args = [
      app.getAppPath() + '/../src/screenManager/RadgeScreen.csproj',
      '/p:Configuration=Release'
  ]
  execFile('msbuild', args, (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr)
      throw error
    }

    checkIsInstalled()
    console.log('stdout', stdout)
  });

  win.webContents.send('running_install_manager', playContent)
})

let checkIsInstalled = function () {
  if (
      fs.existsSync(app.getAppPath() + '/../src/screenPack/radge_screen.exe') &&
      fs.existsSync(app.getAppPath() + '/../src/screenManager/obj/Release/RadgeScreen.exe')
  ) {
    win.webContents.send('check_is_installed', true)
  } else {
    win.webContents.send('check_is_installed', false)
  }
}

ipcMain.on('play', function () {
  let playContent = 'Jugando'

  const exec = require('child_process').exec;

  exec(app.getAppPath() + '/../src/screenManager/obj/Release/RadgeScreen.exe', (e, stdout, stderr)=> {
    if (e instanceof Error) {
      console.error(e);
      throw e;
    }
    console.log('stdout ', stdout);
    console.log('stderr ', stderr);
  });


  win.webContents.send('running_play', playContent)
})

ipcMain.on('exec_tpv', function () {
  let playContent = 'Ejecutando TPV'

  const execFile = require('child_process').execFile
  let args = [
    'run',
    'electron:serve',
  ]
  execFile('npm', args, (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr)
      throw error
    }

    checkIsInstalled()
    console.log('stdout', stdout)
  });


  win.webContents.send('running_tpv', playContent)
})

ipcMain.on('check_is_installed', checkIsInstalled)

// Files data
const csv = require('csv')
const directoriesPath = app.getAppPath() +'/data/directories.json'
const configFilename = '/config.json'
let directories = {}

let getDirectoriesPath = function () {
  fs.readFile(directoriesPath, function read(err, data) {
    if (err) {
      throw err
    }
    directories = JSON.parse(data)
  })
}
getDirectoriesPath()

let convertPath = function(path) {
  let pathToReturn = path.replace('app://', app.getAppPath() + '/')
  return pathToReturn
}

// Save config event
ipcMain.on('save_config', function (event, config) {
  let isDone = false
  try {
    // Save directories to app data directories file and global variable
    directories = { "data_dir": config.data_dir, "import_dir": config.import_dir }
    fs.writeFileSync(directoriesPath, JSON.stringify(directories), 'utf-8')

    // Save config file to data_dir path
    let pathData = convertPath(directories.data_dir.path)
    fs.writeFileSync(pathData + configFilename, JSON.stringify(config), 'utf-8')
    isDone = true
  } catch(e) { console.log('stdout', 'Fallo al guardar la configuración: ' + e.message) }

  win.webContents.send('save_config', isDone)
})

// Get config event
ipcMain.on('get_config', function () {
  let configToReturn = {}
  try {
    // Get config path from data dir in directories variable
    let pathData = convertPath(directories.data_dir.path)

    // Get config data from file config
    let rawData = fs.readFileSync(pathData + configFilename, function read(err) {
      if (err) {
        throw err
      }
    })
    configToReturn = JSON.parse(rawData)
  } catch(e) { console.log('stdout', 'Fallo al recuperar la configuración: ' + e.message) }

  win.webContents.send('get_config', configToReturn)
})

// Get domain headers event
ipcMain.on('get_headers', function (event, domain, format) {
  let headersToReturn = []
  try {
    if (format === 'csv') {
      let importPath = convertPath(directories.import_dir.path)

      csv()
          .from(importPath + '/' + domain + '.' + format)
          .on('data', (data) => {
            if (headersToReturn.length <= 0) {
              headersToReturn = data.split(',')
            }
          })
          .on('end',function(){ // count
            win.webContents.send('get_headers', domain, headersToReturn)
          })
          .on('error',function(error){
            console.log('stdout', error.message)
            headersToReturn = false
          })
    }
  } catch(e) {
    console.log('stdout', 'Fallo al recuperar las cabeceras: ' + e.message)
    headersToReturn = false
  }
})

// Get domain content event
ipcMain.on('get_content', function (event, domain, format) {
  let contentToReturn = []
  let headers = {}
  let counterLines = 0
  try {
    if (format === 'csv') {
      let importPath = convertPath(directories.import_dir.path)

      csv()
          .from(importPath + '/' + domain + '.' + format)
          .on('data', (dataString) => {
            if (counterLines <= 0) {
              csv()
                  .from.string(dataString, {comment: '#'})
                  .to.array(function (data) {
                for (let i = 0; i < data[0].length; i++) {
                  headers['element' + i] = data[0][i]
                }
              })
            }
            if (counterLines > 0) {
              csv()
                  .from.string(dataString, {comment: '#'})
                  .to.array(function (data) {
                let elementToPush = []
                for (let i = 0; i < data[0].length; i++) {
                  elementToPush.push({
                    column: headers['element' + i],
                    content: data[0][i],
                  })
                }
                contentToReturn.push(elementToPush)
              })
            }
            counterLines++
          })
          .on('end',function(){ // count
            win.webContents.send('get_content', domain, contentToReturn)
          })
          .on('error',function(error){
            console.log('stdout', error.message)
            contentToReturn = false
          })
    }
  } catch(e) {
    console.log('stdout', 'Fallo al recuperar las cabeceras: ' + e.message)
    contentToReturn = false
  }
})

