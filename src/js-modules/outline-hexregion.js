export default function outline_hexregion(cells, color, path_container) {
    const line_segments = [];

    // for ea cell, return edges to neighbors not in cells
    cells.reduce((result, hex) => {
        const neighbors = hex.neighbors.filter((cell) => !cells.includes(cell));
        const top = top_point(hex);
        const bottom = bottom_point(hex);
        const bottom_right = right_bottom_point(hex);
        const bottom_left = left_bottom_point(hex);
        // TODO tweak this so the outline is drawn inside the hex and not on top of its outline
        // left
        if (neighbors.find(
            (neighbor) =>
                neighbor.r === hex.r &&
                neighbor.s === (hex.s + 1)
        )) {
            result.push(`M${bottom_left} v-3`);
        }
        // right
        if (neighbors.find(
            (neighbor) =>
                neighbor.r === hex.r &&
                neighbor.s === (hex.s - 1)
        )) {
            result.push(`M${bottom_right} v-3`);
        }
        // top left
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s + 1)
        )) {
            result.push(`M${top} L${left_top_point(hex)}`);
        }
        // bottom right
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s - 1)
        )) {
            result.push(`M${bottom} L${bottom_right}`);
        }
        // top right
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r - 1)
        )) {
            result.push(`M${top} L${right_top_point(hex)}`);
        }
        // bottom left
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r + 1)
        )) {
            result.push(`M${bottom} L${bottom_left}`);
        }

        return result;
    }, line_segments);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('d', line_segments.join(''));
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '0.3');

    path_container.append(path);
}

function top_point(hex) {
    return `${hex.cx + 3} ${hex.cy}`;
}

function bottom_point(hex) {
    return `${hex.cx + 3} ${hex.cy + 6}`;
}

function left_top_point(hex) {
    return `${hex.cx} ${hex.cy + 1.5}`;
}

function left_bottom_point(hex) {
    return `${hex.cx} ${hex.cy + 4.5}`;
}

function right_top_point(hex) {
    return `${hex.cx + 6} ${hex.cy + 1.5}`;
}

function right_bottom_point(hex) {
    return `${hex.cx + 6} ${hex.cy + 4.5}`;
}