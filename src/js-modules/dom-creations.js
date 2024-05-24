export const cellGroupTmpl = (() => {
    const cell = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const cellWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    cell.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#outer-hex');
    cell.classList.add('outer-cell');
    cellWrapper.classList.add('cell');

    cellWrapper.append(cell);

    return cellWrapper;
})();

export const player_config_tmpl = document.getElementById('player-config-tmpl').content;