import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './views/App.vue'
import { getStylesFromStylesheet, getUniqueSelector } from './utils'
import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })

  function startHoverDebugger() {
    console.log('startHoverDebugger')
    let clickedElement
    document.addEventListener('mouseover', (event) => {
      event.preventDefault()
      event.stopPropagation()
      const element = event.target
      if (clickedElement === element)
        return
      // Highlight the element
      element.style.outline = '1px dashed grey'

      // Remove the highlight when the mouse leaves
      element.addEventListener('mouseout', () => {
        if (clickedElement === element)
          return
        element.style.outline = ''
      }, { once: true })
    })
    document.addEventListener('click', (event) => {
      event.preventDefault()
      if (clickedElement) {
        clickedElement.style.outline = ''
      }
      const element = event.target
      clickedElement = element
      element.style.outline = '1px dashed red'

      // !! now magic starts, send element info to sidebar !!
      console.log('el', getUniqueSelector(element))
      sendMessage('INSPECT_ELEMENT', { selector: getUniqueSelector(element) }, { context: 'background' })
    })
  }

  onMessage('START_HOVER_DEBUGGER', ({ data }) => {
    startHoverDebugger()
  })

  // mount component to context window
  const container = document.createElement('div')
  container.id = __NAME__
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
