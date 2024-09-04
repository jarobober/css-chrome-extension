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

  private log(message: string): void {
    console.log(`[DebuggerTransmitter]: ${message}`)
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
}
