export const cellGroupTmpl = (() => {
    const outerHex = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const innerHex = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const cellWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    innerHex.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#inner-hex');
    outerHex.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#outer-hex');
    innerHex.classList.add('inner-cell');
    outerHex.classList.add('outer-cell');
    cellWrapper.classList.add('cell');

    cellWrapper.append(outerHex, innerHex);

    return cellWrapper;
})();

export const player_config_tmpl = document.getElementById('player-config-tmpl').content;