import path from 'path'
import { app, session } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

// Ignore certificate errors
app.commandLine.appendSwitch('ignore-certificate-errors')

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

  // -------------------------- THESE ENTRIES ARE CODE FOR BYPASSING CHROMIUM COOKIE/HEADER SECURITY THIS MAY BE A SECURITY RISK --------------------------

  // Because this app is kinda unorthodox, we need to hijack the cookies and steal the AIROS_ session cookie from the response headers Set-Cookies
  // This is because chromium will block the Set-Cookie from being set in the renderer process, so we need to set it in the main process
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['https://*/*'] },
    (details, callback) => {
      if (
        details.responseHeaders &&
        details.responseHeaders['Set-Cookie'] &&
        details.responseHeaders['Set-Cookie'].length
      ) {
        details.responseHeaders['Set-Cookie'].forEach((cookie) => {
          // Extract AIROS_ session cookie and make it some other type of header
          if (cookie.includes('AIROS_')) {
            // Define the name for the header to store the hijacked cookie
            const hijackingHeaderName = 'ather_hijack_airos_cookie';

            // Make sure this hijack header exists
            if (!details.responseHeaders[hijackingHeaderName]) details.responseHeaders[hijackingHeaderName] = [];

            // Store the AIROS_(MACADDRESS)=(TOKEN) data in the hijack header
            details.responseHeaders[hijackingHeaderName].push(cookie.slice(0, 51));
            return;
          }
        });
      }
      callback({ cancel: false, responseHeaders: details.responseHeaders });
    },
  );

  // Also hook the request headers to make ather_request_cookies => cookie header
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['https://*/*'] }, (details, callback) => {
    if (details.requestHeaders['ather_request_cookies']) {
      const cookies = details.requestHeaders['ather_request_cookies'];
      delete details.requestHeaders['ather_request_cookies'];
      details.requestHeaders['Cookie'] = cookies;
    }

    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // -------------------------- THESE ENTRIES ARE CODE FOR BYPASSING CHROMIUM COOKIE/HEADER SECURITY THIS MAY BE A SECURITY RISK --------------------------

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})
