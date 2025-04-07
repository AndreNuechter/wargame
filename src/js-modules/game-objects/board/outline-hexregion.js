// TODO find a way to use this. rn if we use this, the edges of our hexes dont connect
// this allows us to draw the outline inside the region and not on top of its border
const edge_offset = 0;

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

    // for ea cell in the region, collect edges to neighbors that aren't in the region
    const line_segments = [...region].reduce((edges, hex_obj) => {
        const outside_neighbors = hex_obj.neighbors.filter((hex) => !region.has(hex));
        const bottom = bottom_point(hex_obj);
        const bottom_right = right_bottom_point(hex_obj);
        const bottom_left = left_bottom_point(hex_obj);
        const top = top_point(hex_obj);
        const top_right = right_top_point(hex_obj);
        const top_left = left_top_point(hex_obj);

        // left
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.r === hex_obj.r &&
                neighbor.s === (hex_obj.s + 1),
        )) {
            edges.push([bottom_left, top_left]);
        }

        // top left
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.q === hex_obj.q &&
                neighbor.s === (hex_obj.s + 1),
        )) {
            edges.push([top_left, top]);
        }

        // top right
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.s === hex_obj.s &&
                neighbor.r === (hex_obj.r - 1),
        )) {
            edges.push([top, top_right]);
        }

        // right
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.r === hex_obj.r &&
                neighbor.s === (hex_obj.s - 1),
        )) {
            edges.push([top_right, bottom_right]);
        }

        // bottom right
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.q === hex_obj.q &&
                neighbor.s === (hex_obj.s - 1),
        )) {
            edges.push([bottom_right, bottom]);
        }

        // bottom left
        if (outside_neighbors.find(
            (neighbor) =>
                neighbor.s === hex_obj.s &&
                neighbor.r === (hex_obj.r + 1),
        )) {
            edges.push([bottom, bottom_left]);
        }

        return edges;
    }, []);

    outline_element.setAttribute('d', points_to_svg_path(
        order_edges(line_segments),
    ));
    outline_element.setAttribute('stroke-width', '0.5');
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

            if (!result.has(point_str)) {
                result.set(point_str, [edge]);
            } else {
                result.get(point_str).push(edge);
            }
        }

        return result;
    }, new Map);
    /** @type{Set<string>} */
    const visited_edges = new Set();
    const path = [];
    const [first_edge] = edges;
    let next_point = first_edge[1];

    path.push(first_edge[0]);
    visited_edges.add(stringify_edge(first_edge));

    while (visited_edges.size < edges.length) {
        const next_point_str = stringify_point(next_point);
        const next_edge = point_to_edges
            .get(next_point_str)
            .find((edge) => !visited_edges.has(stringify_edge(edge)));

        path.push(next_point);
        visited_edges.add(stringify_edge(next_edge));

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
 * @param {Edge} edge
 * @returns {string}
 */
function stringify_edge([point1, point2]) {
    return [stringify_point(point1), stringify_point(point2)]
        .sort()
        .join('|');
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
 * @returns {Point}
 */
function top_point(hex_obj) {
    return make_point(hex_obj.cx + 3, hex_obj.cy + edge_offset);
}

/**
 * @param {Hex_Cell} hex_obj
 * @returns {Point}
 */
function bottom_point(hex_obj) {
    return make_point(hex_obj.cx + 3, hex_obj.cy + 6 - edge_offset);
}

/**
 * @param {Hex_Cell} hex_obj
 * @returns {Point}
 */
function left_top_point(hex_obj) {
    return make_point(hex_obj.cx + edge_offset, hex_obj.cy + 1.5 + edge_offset * 0.5);
}

/**
 * @param {Hex_Cell} hex_obj
 * @returns {Point}
 */
function left_bottom_point(hex_obj) {
    return make_point(hex_obj.cx + edge_offset, hex_obj.cy + 4.5 - edge_offset * 0.5);
}

/**
 * @param {Hex_Cell} hex_obj
 * @returns {Point}
 */
function right_top_point(hex_obj) {
    return make_point(hex_obj.cx + 6 - edge_offset, hex_obj.cy + 1.5 + edge_offset * 0.5);
}

/**
 * @param {Hex_Cell} hex_obj
 * @returns {Point}
 */
function right_bottom_point(hex_obj) {
    return make_point(hex_obj.cx + 6 - edge_offset, hex_obj.cy + 4.5 - edge_offset * 0.5);
}