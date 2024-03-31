export const outerHexTmpl = (() => {
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#outer-hex');
    use.classList.add('outer-cell');
    return use;
})();
export const innerHexTmpl = (() => {
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#inner-hex');
    use.classList.add('inner-cell');
    return use;
})();
export const cellGroupTmpl = (() => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('cell');
    return group;
})();