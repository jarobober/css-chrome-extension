import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import { debuggerTasks } from './utils'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = true

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

function runEnableHover() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    console.log('tab', tab)
    sendMessage('START_HOVER_DEBUGGER', {}, { context: 'content-script', tabId: tab.id })
    // chrome.debugger.attach({ tabId: tab.id }, '1.3', () => {
    //   chrome.debugger.sendCommand({ tabId: tab.id }, 'DOM.enable')
    //   chrome.debugger.sendCommand({ tabId: tab.id }, 'CSS.enable')

    // })
  })
}

onMessage('TOGGLE_HOVER', ({ data }) => {
  console.log('TOGGLE_HOVER', data)
  if (data.enable) {
    runEnableHover()
  }
  else {
    runDisableHover()
  }
})

onMessage('ELEMENT_INFO', ({ data }) => {
  console.log('ELEMENT_INFO', data)
})

// onMessage('DEBUG_ELEMENT', (response) => {
//   console.log('DEBUG_ELEMENT selector', response)
//   // debuggerTasks(previousTabId, data)
// })

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'hoveredElement') {
    console.log('?', message, sender)
    const selector = message.selector
    const tabId = sender.tab?.id
    debuggerTasks(tabId, selector)
  }
})
