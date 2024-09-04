import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './views/App.vue'
import { getStylesFromStylesheet, getUniqueSelector } from './utils'
import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('q[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })

  function startHoverDebugger() {
    console.log('startHoverDebugger')
    document.addEventListener('click', (event) => {
      const element = event.target

      // Highlight the element
      element.style.outline = '2px solid red'

      // Remove the highlight when the mouse leaves
      element.addEventListener('mouseout', () => {
        element.style.outline = ''
      }, { once: true })

      console.log('element', element)

      const selector = getUniqueSelector(element)

      chrome.runtime.sendMessage({ type: 'hoveredElement', selector })

      // getStylesFromStylesheet(element)

      // console.log('!!!!!', { el: { ...element } })

      // const elementInfo = {
      //   tagName: element.tagName,
      //   id: element.id,
      //   classList: [...element.classList],
      //   computedStyles: window.getComputedStyle(element),
      //   styles: element.style.cssText,
      //   cssRules: [],
      // }

      // console.log('elementInfo', elementInfo)

      // sendMessage('ELEMENT_INFO', elementInfo, 'popup')

      // send info to popup
    })
  }

  onMessage('START_HOVER_DEBUGGER', ({ data }) => {
    startHoverDebugger()
  })

  // document.addEventListener('click', (event) => {
  //   // event.preventDefault()
  //   console.log('klik')
  //   const clickedElement = event.target

  //   // Object to store the CSS properties
  //   const cssProperties = {}

  //   // Get inline styles
  //   const inlineStyles = clickedElement.style
  //   for (let i = 0; i < inlineStyles.length; i++) {
  //     const prop = inlineStyles[i]
  //     cssProperties[prop] = inlineStyles.getPropertyValue(prop)
  //   }

  //   // Get styles from stylesheets for classes and ID
  //   const stylesheets = document.styleSheets
  //   console.log('sheets', stylesheets)
  //   for (let i = 0; i < stylesheets.length; i++) {
  //     const rules = stylesheets[i].rules || stylesheets[i].cssRules
  //     console.log('i', i)
  //     if (rules) {
  //       console.log('rules', i, rules)
  //       for (let j = 0; j < rules.length; j++) {
  //         const rule = rules[j]

  //         // Check if the rule applies to the element by class or ID
  //         if (
  //           rule.selectorText
  //           && (clickedElement.matches(rule.selectorText))
  //         ) {
  //           for (let k = 0; k < rule.style.length; k++) {
  //             const prop = rule.style[k]
  //             cssProperties[prop] = rule.style.getPropertyValue(prop)
  //           }
  //         }
  //       }
  //     }
  //   }

  //   console.log('css', cssProperties)

  //   // Send the CSS properties to the background script or popup
  //   chrome.runtime.sendMessage({ cssProperties })
  // })

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
