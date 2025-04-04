
const stroke_width = 0.5;
// this allows us to draw the outline inside the region and not on top of its border
const edge_offset = stroke_width * 0.5;

export default outline_hexregion;

// FIXME path segments dont connect so that there's a visible gap and we cant fill a region... figure out a way to sort the line segments, so that we need only one `M` command and we could fill the pathes
/**
 * @param {Set<Hex_Cell>} region
 * @param {SVGPathElement} outline_element
 */
function outline_hexregion(
    region,
    outline_element,
    {
        color = 'white',
        stroked_outline = false,
    } = {},
) {
    const line_segments = [];

    // for ea cell, return edges to neighbors not in the region
    [...region].reduce((result, hex) => {
        const neighbors = hex.neighbors.filter((cell) => !region.has(cell));
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
                neighbor.s === (hex.s + 1),
        )) {
            result.push(`M${bottom_left}L${top_left}`);
        }

        // top left
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s + 1),
        )) {
            result.push(`M${top_left}L${top}`);
        }

        // top right
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r - 1),
        )) {
            result.push(`M${top}L${top_right}`);
        }

        // right
        if (neighbors.find(
            (neighbor) =>
                neighbor.r === hex.r &&
                neighbor.s === (hex.s - 1),
        )) {
            result.push(`M${top_right}L${bottom_right}`);
        }

        // bottom right
        if (neighbors.find(
            (neighbor) =>
                neighbor.q === hex.q &&
                neighbor.s === (hex.s - 1),
        )) {
            result.push(`M${bottom_right}L${bottom}`);
        }

        // bottom left
        if (neighbors.find(
            (neighbor) =>
                neighbor.s === hex.s &&
                neighbor.r === (hex.r + 1),
        )) {
            result.push(`M${bottom}L${bottom_left}`);
        }

        return result;
    }, line_segments);

    outline_element.setAttribute('d', line_segments.join(''));
    outline_element.setAttribute('stroke-width', stroke_width.toString());
    outline_element.setAttribute('stroke', color);

    if (stroked_outline) {
        outline_element.setAttribute('stroke-dasharray', (1).toString());
    }

    return outline_element;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function top_point(hex_obj) {
    return `${hex_obj.cx + 3} ${hex_obj.cy + edge_offset}`;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function bottom_point(hex_obj) {
    return `${hex_obj.cx + 3} ${hex_obj.cy + 6 - edge_offset}`;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function left_top_point(hex_obj) {
    return `${hex_obj.cx + edge_offset} ${hex_obj.cy + 1.5 + edge_offset * 0.5}`;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function left_bottom_point(hex_obj) {
    return `${hex_obj.cx + edge_offset} ${hex_obj.cy + 4.5 - edge_offset * 0.5}`;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function right_top_point(hex_obj) {
    return `${hex_obj.cx + 6 - edge_offset} ${hex_obj.cy + 1.5 + edge_offset * 0.5}`;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function right_bottom_point(hex_obj) {
    return `${hex_obj.cx + 6 - edge_offset} ${hex_obj.cy + 4.5 - edge_offset * 0.5}`;
}