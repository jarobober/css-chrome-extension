import { sendMessage } from 'webext-bridge/background'

export class DebuggerTransmitter {
  private static instance: DebuggerTransmitter
  private transmitter: {
    isAttached: boolean
    currentTabId?: number
  }

  private constructor() {
    this.transmitter = {
      isAttached: false,
      currentTabId: undefined,
    }
  }

  private log(message: string, data?: any): void {
    console.log(`[DebuggerTransmitter]: ${message}`, data || '')
  }

  public static getInstance(): DebuggerTransmitter {
    if (!DebuggerTransmitter.instance) {
      DebuggerTransmitter.instance = new DebuggerTransmitter()
    }
    return DebuggerTransmitter.instance
  }

  public attachDebugger(tabId: number): void {
    this.transmitter.currentTabId = tabId
    chrome.debugger.attach({ tabId: this.transmitter.currentTabId }, '1.3', () => {
      this.log('Debugger attached.')
      this.transmitter.isAttached = true
    })
  }

  public detachDebugger(): void {
    this.transmitter.currentTabId = undefined
    chrome.debugger.detach({ tabId: this.transmitter.currentTabId }, () => {
      this.log('Debugger detached.')
      this.transmitter.isAttached = false
    })
  }

  private sendToPanel(data): void {
    sendMessage('SHOW_INSPECT_DATA', { data }, { context: 'popup' })
  }

  public runDebugger(tabId, selector): any {
    chrome.debugger.sendCommand({ tabId }, 'DOM.enable', {}, (result) => {
      chrome.debugger.sendCommand({ tabId }, 'DOM.getDocument', {}, (root) => {
        this.log('Root', root)
        const rootNodeId = root.root.nodeId

        // Query the document to find the node corresponding to the selector
        chrome.debugger.sendCommand({
          tabId,
        }, 'DOM.querySelector', {
          nodeId: rootNodeId,
          selector,
        }, (response) => {
          console.log('xxx', response)
          this.log('response', response)
          const nodeId = response.nodeId
          chrome.debugger.sendCommand({ tabId }, 'CSS.enable', {}, (result) => {
            this.log('CSS enabled.', result)
            if (nodeId) {
            // Get the computed styles for the hovered element
              chrome.debugger.sendCommand({ tabId }, 'CSS.getComputedStyleForNode', { nodeId }, (styles) => {
                this.log('Computed Styles:', styles)
              // sendResponse({ computedStyles: styles.computedStyle })
              })

              // Get the matching CSS rules for the hovered element
              chrome.debugger.sendCommand({ tabId }, 'CSS.getMatchedStylesForNode', { nodeId }, (styles) => {
                this.log('Matched CSS Rules:', styles)
                this.sendToPanel(styles)
              // sendResponse({ matchedCSSRules: styles.matchedCSSRules })
              })
            }
            else {
              this.log('No node found for selector:', selector)
            }
          })
        })
      })
    })
  }

  public inspectElement(selector: string): void {
    if (this.transmitter.isAttached) {
      console.log('Inspect Element', selector)
      this.runDebugger(this.transmitter.currentTabId, selector)
    }
  }
}
