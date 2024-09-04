function getStylesFromStylesheet(element) {
  const computedStyles = window.getComputedStyle(element)
  const parentStyles = element.parentElement ? window.getComputedStyle(element.parentElement) : null

  const stylesheetStyles = {}

  // Iterate over all stylesheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    const stylesheet = document.styleSheets[i]
    try {
      // Iterate over all CSS rules in the stylesheet
      for (let j = 0; j < stylesheet.cssRules.length; j++) {
        const rule = stylesheet.cssRules[j]

        // Check if the rule applies to the current element
        if (element.matches(rule.selectorText)) {
          // Iterate over the style declarations in the rule
          for (let k = 0; k < rule.style.length; k++) {
            const property = rule.style[k]
            const value = computedStyles.getPropertyValue(property)
            const parentValue = parentStyles ? parentStyles.getPropertyValue(property) : null

            // Only add the style if it's not inherited and is different from the parent
            if (value && value !== parentValue) {
              stylesheetStyles[property] = value
            }
          }
        }
      }
    }
    catch (e) {
      console.warn(`Could not access stylesheet: ${stylesheet.href}`, e)
    }
  }

  console.log('Styles from Stylesheet for Element:', element, stylesheetStyles)
  return stylesheetStyles
}

function getUniqueSelector(el) {
  if (el.tagName.toLowerCase() === 'html')
    return 'html'
  let path = ''
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase()
    if (el.id) {
      selector += `#${el.id}`
      path = `${selector} ${path}`
      break
    }
    else {
      let sib = el; let nth = 1
      while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector)
          nth++
      }
      if (nth !== 1)
        selector += `:nth-of-type(${nth})`
    }
    path = `${selector} ${path}`
    el = el.parentNode
  }
  return path.trim()
}

export { getStylesFromStylesheet, getUniqueSelector }
