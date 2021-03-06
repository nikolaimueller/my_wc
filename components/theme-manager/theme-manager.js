
let _baseThemeLink = ''
let _dropPaths = []

function concatPath(part1, part2) {
    // drop prefix path if given.
    if (_dropPaths.length > 0) {
        let matchDropPath = _dropPaths.find(drop => {
            return part2.startsWith(drop)
        })
        if (matchDropPath !== undefined) {
            part2 = part2.substr(matchDropPath.length)
        }
    }
    // Concat ensuring clean slashes ("/") in path 
    if (part1.endsWith('/') && part2.startsWith('/')) {
        return part1 + part2.substring(1);
    } else if (!part1.endsWith('/') && !part2.startsWith('/')) {
        return part1 + '/' + part2;
    }
    return part1 + part2;
}

export function setThemeBaseLink(baseThemeLink, dropPaths) {
    _baseThemeLink = baseThemeLink
    if (dropPaths && Array.isArray(dropPaths)) {
        _dropPaths = dropPaths || []
    }
    console.log(`ThemeManager.setThemeBaseLink to: "${baseThemeLink}".`);
}

export function applyTheme(documentFragment, stylesheetLink) {    
    if (documentFragment instanceof DocumentFragment === false)  {
        console.warn('ThemeManager.applyTheme: Error: arg "documentFragment" is of wrong prototype! (Must be "DocumentFragment")');
        return
    }
    if (_baseThemeLink.length === 0) {
        console.warn('ThemeManager.applyTheme: Error: "baseThemeLink" has not been set! (call "setThemeBaseLink" before calling "applyTheme" !)');
        return
    }
    if (stylesheetLink.length < 5 || !stylesheetLink.endsWith('.css')) {
        console.warn(`ThemeManager.applyTheme: Error: "stylesheetLink" ("${stylesheetLink}") has invallid value!`);
        return
    }
    
    let stylesheetLinkUrl = new URL(stylesheetLink)
    let stylesheetLinkHref = concatPath(_baseThemeLink, stylesheetLinkUrl.pathname)
    
    let linkTheme = document.createElement('link');
    linkTheme.setAttribute('rel', 'stylesheet');
    linkTheme.setAttribute('href', stylesheetLinkHref);
    linkTheme.setAttribute('name', 'theme-manager');
    let result = documentFragment.appendChild(linkTheme);

    return result;
}

export function switchTheme(rootElement, oldBaseThemeLink, newBaseThemeLink) {
    // console.log(`ThemeManager.switchTheme - oldBaseThemeLink: ${oldBaseThemeLink} - newBaseThemeLink: ${newBaseThemeLink} - rootElement`, rootElement);

    let element;  // current element
    let children; // Array of children (child-elements)

    if (rootElement.shadowRoot !== null) {
        // console.log(`ThemeManager.switchTheme: rootElement - has shadowRoot - localName: ${rootElement.localName}`);
        element = rootElement
        children = Array.from(element.shadowRoot.children)
        
        // Get the old theme element
        let themeLink = children.find(node => {
            let name = node.getAttribute('name')
            return name === 'theme-manager'
        })

        if (themeLink) {
            // console.log(`ThemeManager.switchTheme: old link child:`, themeLink);
            let oldLinkHref = themeLink.getAttribute('href')
            let newLinkHref = oldLinkHref.replace(oldBaseThemeLink, newBaseThemeLink)            
            themeLink.setAttribute('href', newLinkHref)
        } else {
            console.warn(`WARNING: ThemeManager.switchTheme: old theme Link not found in element!`, element)
        }
    } else if (rootElement instanceof HTMLElement === true) {
        // console.log(`ThemeManager.switchTheme: rootElement instanceof HTMLElement - localName: ${rootElement.localName}`);
        element = rootElement
        children = Array.from(element.children)
    } else {
        console.warn(`ThemeManager.switchTheme: rootElement instanceof ???`, rootElement);
        element = rootElement
        children = Array.from(element.children)
    }
    
    // Recurse through child-elements
    children.forEach(child => {
        // Recurse into
        if (child instanceof HTMLElement && child.localName !== 'link') {
            switchTheme(child, oldBaseThemeLink, newBaseThemeLink)
        }
    })

    // Set internal base-theme-link
    _baseThemeLink = newBaseThemeLink
}
