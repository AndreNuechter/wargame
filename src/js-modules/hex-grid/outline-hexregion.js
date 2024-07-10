import { path_tmpl } from '../dom-creations';

const stroke_width = 0.5;
// this allows us to draw the outline inside the region and not on top of its border
// FIXME path segments dont connect so that there's a visible gap and we cant fill a region
// TODO figure out a way to sort the line segments, so that we need only one `M` command and we could fill the pathes
const edge_offset = stroke_width * 0.5;

export default function outline_hexregion(cells, color, path_container) {
    const line_segments = [];

    // for ea cell, return edges to neighbors not in cells
    cells.reduce((result, hex) => {
        const neighbors = hex.neighbors.filter((cell) => !cells.includes(cell));
        const top = top_point(hex);
        const bottom = bottom_point(hex);
        const bottom_right = right_bottom_point(hex);
        const bottom_left = left_bottom_point(hex);
        const top_right = right_top_point(hex);
        const top_left = left_top_point(hex);

        // left
        if (neighbors.find(
            (neighbor) =>
                neighbor.r === hex.r &&
                neighbor.s === (hex.s + 1)
        )) {
            result.push(`M${bottom_left}L${top_left}`);
        }
        // top left
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s + 1)
        )) {
            result.push(`M${top_left}L${top}`);
        }
        // top right
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r - 1)
        )) {
            result.push(`M${top}L${top_right}`);
        }
        // right
        if (neighbors.find(
            (neighbor) =>
                neighbor.r === hex.r &&
                neighbor.s === (hex.s - 1)
        )) {
            result.push(`M${top_right}L${bottom_right}`);
        }
        // bottom right
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s - 1)
        )) {
            result.push(`M${bottom_right}L${bottom}`);
        }
        // bottom left
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r + 1)
        )) {
            result.push(`M${bottom}L${bottom_left}`);
        }

        return result;
    }, line_segments);

    const path = path_tmpl.cloneNode(true);

    path.setAttribute('d', line_segments.join(''));
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', stroke_width);

    path_container.append(path);
}

function top_point(hex) {
    return `${hex.cx + 3} ${hex.cy + edge_offset}`;
}

function bottom_point(hex) {
    return `${hex.cx + 3} ${hex.cy + 6 - edge_offset}`;
}

function left_top_point(hex) {
    return `${hex.cx + edge_offset} ${hex.cy + 1.5 + edge_offset * 0.5}`;
}

function left_bottom_point(hex) {
    return `${hex.cx + edge_offset} ${hex.cy + 4.5 - edge_offset * 0.5}`;
}

function right_top_point(hex) {
    return `${hex.cx + 6 - edge_offset} ${hex.cy + 1.5 + edge_offset * 0.5}`;
}

function right_bottom_point(hex) {
    return `${hex.cx + 6 - edge_offset} ${hex.cy + 4.5 - edge_offset * 0.5}`;
}