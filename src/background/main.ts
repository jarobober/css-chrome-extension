import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import { debuggerTasks } from './utils'
import { DebuggerTransmitter } from './debuggerTransmitter'

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

let transmitter

function runEnableHover() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    if (tab.id) {
      transmitter = DebuggerTransmitter.getInstance()
      transmitter.attachDebugger(tab.id)
      console.log('tab', tab)
      sendMessage('START_HOVER_DEBUGGER', {}, { context: 'content-script', tabId: tab.id })
    }
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

// native handling as in web-ext bridge lack of sender.tab?.id
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'hoveredElement') {
    // console.log('?', message, sender)
    // const selector = message.selector
    // const tabId = sender.tab?.id
    // debuggerTasks(tabId, selector)
  }
})
