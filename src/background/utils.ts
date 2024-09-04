function debuggerTasks(tabId, selector) {
  chrome.debugger.attach({ tabId }, '1.3', () => {
    console.log('Debugger attached.')

    // Get the root document
    chrome.debugger.sendCommand({ tabId }, 'DOM.getDocument', {}, (root) => {
      console.log('Root', root)
      const rootNodeId = root.root.nodeId

      // Query the document to find the node corresponding to the selector
      chrome.debugger.sendCommand({
        tabId,
      }, 'DOM.querySelector', {
        nodeId: rootNodeId,
        selector,
      }, (response) => {
        console.log('response', response)
        const nodeId = response.nodeId
        chrome.debugger.sendCommand({ tabId }, 'CSS.enable', {}, (result) => {
          console.log('CSS enabled.', result)
        })
        if (nodeId) {
          console.log('run')
          // Get the computed styles for the hovered element
          chrome.debugger.sendCommand({ tabId }, 'CSS.getComputedStyleForNode', { nodeId }, (styles) => {
            console.log('Computed Styles:', styles)
            // sendResponse({ computedStyles: styles.computedStyle })
          })

          // Get the matching CSS rules for the hovered element
          chrome.debugger.sendCommand({ tabId }, 'CSS.getMatchedStylesForNode', { nodeId }, (styles) => {
            console.log('Matched CSS Rules:', styles)
            // sendResponse({ matchedCSSRules: styles.matchedCSSRules })
          })
        }
        else {
          console.error('No node found for selector:', selector)
        }
      })
    })
  })
}

export { debuggerTasks }
