// this allows us to draw the outline inside the region and not on top of its border
const edge_offset = 0.4;
const half_edge_offset = edge_offset * 0.5;
const hex_diameter = 6;
const hex_radius = hex_diameter * 0.5;
const hex_half_radius = hex_radius * 0.5;
const hex_three_quarter_diameter = hex_diameter * 0.75;

export default outline_hexregion;

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
    if (region.size === 0) return;

    // for ea hex in the region, collect edges to neighbors that aren't in the region
    const edges = [...region].reduce((result, hex_obj) => {
        const outside_neighbors = hex_obj.neighbors.filter((hex) => !region.has(hex));
        // NOTE: our hexes are pointy top and therefore have the following edges...
        const left_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.r === hex_obj.r &&
                neighbor.s === (hex_obj.s + 1),
        );
        const top_left_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.q === hex_obj.q &&
                neighbor.s === (hex_obj.s + 1),
        );
        const top_right_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.s === hex_obj.s &&
                neighbor.r === (hex_obj.r - 1),
        );
        const right_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.r === hex_obj.r &&
                neighbor.s === (hex_obj.s - 1),
        );
        const bottom_right_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.q === hex_obj.q &&
                neighbor.s === (hex_obj.s - 1),
        );
        const bottom_left_edge_is_border = outside_neighbors.some(
            (neighbor) =>
                neighbor.s === hex_obj.s &&
                neighbor.r === (hex_obj.r + 1),
        );
        // NOTE: to inset the outline,
        // we offset a point, w 2 adjacent edges outside, towards the center of the hex and
        // a point, w only one adjacent edge outside, towards the center of the edge that's inside
        const bottom_point = mk_bottom_point(hex_obj, bottom_left_edge_is_border, bottom_right_edge_is_border);
        const bottom_left_point = mk_left_bottom_point(hex_obj, left_edge_is_border, bottom_left_edge_is_border);
        const bottom_right_point = mk_right_bottom_point(hex_obj, bottom_right_edge_is_border, right_edge_is_border);
        const top_point = mk_top_point(hex_obj, top_left_edge_is_border, top_right_edge_is_border);
        const top_right_point = mk_right_top_point(hex_obj, right_edge_is_border, top_right_edge_is_border);
        const top_left_point = mk_left_top_point(hex_obj, top_left_edge_is_border, left_edge_is_border);

        if (left_edge_is_border) {
            result.push([bottom_left_point, top_left_point]);
        }

        if (top_left_edge_is_border) {
            result.push([top_left_point, top_point]);
        }

        if (top_right_edge_is_border) {
            result.push([top_point, top_right_point]);
        }

        if (right_edge_is_border) {
            result.push([top_right_point, bottom_right_point]);
        }

        if (bottom_right_edge_is_border) {
            result.push([bottom_right_point, bottom_point]);
        }

        if (bottom_left_edge_is_border) {
            result.push([bottom_point, bottom_left_point]);
        }

        return result;
    }, []);

    outline_element.setAttribute('d', points_to_svg_path(order_edges(edges)));
    outline_element.setAttribute('stroke', color);

    if (stroked_outline) {
        outline_element.setAttribute('stroke-dasharray', '1');
    }
}

/**
 *
 * @param {Point[]} points
 * @returns {string}
 */
function points_to_svg_path(points) {
    const str = points
        .map(({ x, y }) => `${x} ${y}`)
        .join('L');

    return `M${str}Z`;
}

/**
 * @param {Edge[]} edges
 * @returns {Point[]}
 */
function order_edges(edges) {
    /** Map a stringified version of ea point of our outline to the two edges it connects.
     * @type{Map<string, Edge[]>}
     **/
    const point_to_edges = edges.reduce((result, edge) => {
        for (const point of edge) {
            const point_str = stringify_point(point);

            if (result.has(point_str)) {
                result.get(point_str).push(edge);
            } else {
                result.set(point_str, [edge]);
            }
        }

        return result;
    }, new Map);
    /** @type{Set<Edge>} */
    const visited_edges = new Set();
    const path = [];
    const [first_edge] = edges;
    let next_point = first_edge[1];

    path.push(first_edge[0]);
    visited_edges.add(first_edge);

    while (visited_edges.size < edges.length) {
        const next_point_str = stringify_point(next_point);
        const next_edge = point_to_edges
            .get(next_point_str)
            .find((edge) => !visited_edges.has(edge));

        path.push(next_point);
        visited_edges.add(next_edge);

        next_point = stringify_point(next_edge[0]) === next_point_str
            ? next_edge[1]
            : next_edge[0];
    }

    return path;
}

/**
 * @param {Point} point
 * @returns {string}
 */
function stringify_point({ x, y }) {
    return `${x} ${y}`;
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {Point}
 */
function make_point(x, y) {
    return { x, y };
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} bottom_left_edge_is_border
 * @param {boolean} bottom_right_edge_is_border
 * @returns {Point|void}
 */
function mk_bottom_point(hex_obj, bottom_left_edge_is_border, bottom_right_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!bottom_left_edge_is_border && !bottom_right_edge_is_border) return;

    const point = make_point(
        hex_obj.cx + hex_radius,
        hex_obj.cy + hex_diameter,
    );

    if (!bottom_left_edge_is_border) {
        // shift the point along the hexes left bottom edge
        point.x -= half_edge_offset;
        point.y -= half_edge_offset;
    } else if (!bottom_right_edge_is_border) {
        // shift the point along the hexes right bottom edge
        point.x += half_edge_offset;
        point.y -= half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.y -= edge_offset;
    }

    return point;
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} left_edge_is_border
 * @param {boolean} bottom_left_edge_is_border
 * @returns {Point|void}
 */
function mk_left_bottom_point(hex_obj, left_edge_is_border, bottom_left_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!left_edge_is_border && !bottom_left_edge_is_border) return;

    const point = make_point(
        hex_obj.cx,
        hex_obj.cy + hex_three_quarter_diameter,
    );

    if (!left_edge_is_border) {
        // shift the point along the hexes left edge
        point.y -= half_edge_offset;
    } else if (!bottom_left_edge_is_border) {
        // shift the point along the hexes left bottom edge
        point.x += half_edge_offset;
        point.y += half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.x += edge_offset;
        point.y -= half_edge_offset;
    }

    return point;
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} bottom_right_edge_is_border
 * @param {boolean} right_edge_is_border
 * @returns {Point|void}
 */
function mk_right_bottom_point(hex_obj, bottom_right_edge_is_border, right_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!bottom_right_edge_is_border && !right_edge_is_border) return;

    const point = make_point(
        hex_obj.cx + hex_diameter,
        hex_obj.cy + hex_three_quarter_diameter,
    );

    if (!bottom_right_edge_is_border) {
        // shift the point along the hexes right bottom edge
        point.x -= half_edge_offset;
        point.y += half_edge_offset;
    } else if (!right_edge_is_border) {
        // shift the point along the hexes right edge
        point.y -= half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.x -= edge_offset;
        point.y -= half_edge_offset;
    }

    return point;
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} top_left_edge_is_border
 * @param {boolean} top_right_edge_is_border
 * @returns {Point|void}
 */
function mk_top_point(hex_obj, top_left_edge_is_border, top_right_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!top_left_edge_is_border && !top_right_edge_is_border) return;

    const point = make_point(
        hex_obj.cx + hex_radius,
        hex_obj.cy,
    );

    if (!top_left_edge_is_border) {
        // shift the point along the hexes top left edge
        point.x -= half_edge_offset;
        point.y += half_edge_offset;
    } else if (!top_right_edge_is_border) {
        // shift the point along the hexes top right edge
        point.x += half_edge_offset;
        point.y += half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.y += edge_offset;
    }

    return point;
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} right_edge_is_border
 * @param {boolean} top_right_edge_is_border
 * @returns {Point|void}
 */
function mk_right_top_point(hex_obj, right_edge_is_border, top_right_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!right_edge_is_border && !top_right_edge_is_border) return;

    const point = make_point(
        hex_obj.cx + hex_diameter,
        hex_obj.cy + hex_half_radius,
    );

    if (!right_edge_is_border) {
        // shift the point along the hexes right edge
        point.y += half_edge_offset;
    } else if (!top_right_edge_is_border) {
        // shift the point along the hexes top right edge
        point.x -= half_edge_offset;
        point.y -= half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.x -= edge_offset;
        point.y += half_edge_offset;
    }

    return point;
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {boolean} top_left_edge_is_border
 * @param {boolean} left_edge_is_border
 * @returns {Point|void}
 */
function mk_left_top_point(hex_obj, top_left_edge_is_border, left_edge_is_border) {
    // if these are both false, the point is not on the periphery of our region
    if (!top_left_edge_is_border && !left_edge_is_border) return;

    const point = make_point(
        hex_obj.cx,
        hex_obj.cy + hex_half_radius,
    );

    if (!top_left_edge_is_border) {
        // shift the point along the hexes top left edge
        point.x += half_edge_offset;
        point.y -= half_edge_offset;
    } else if (!left_edge_is_border) {
        // shift the point along the hexes left edge
        point.y += half_edge_offset;
    } else {
        // shift the point towards the hex's center
        point.x += edge_offset;
        point.y += half_edge_offset;
    }

    return point;
}