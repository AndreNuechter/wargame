type Move_Queue = Player_Move[][]

enum Season {
    spring,
    summer,
    autumn,
    winter
}

interface Hex_Cell { }

enum Move_Type {
    settle,
    unspecified
}

/**
 * A Player move from one cell to another.
 * @typedef {Object} Move
 * @property {String} season - One of the values [spring | summer | autumn | winter].
 * @property {Hex_Cell} origin - The hex-cell being moved from.
 * @property {Hex_Cell} target - The hex-cell being moved to.
 * @property {Number} units - The number of units sent.
 * @property {String} type - The type of movement [settle | unspecified].
 * @property {SVGGeometryElement} arrow - The SVG element visualizing the move.
 */
interface Player_Move {
    season: Season;
    origin: Hex_Cell;
    target: Hex_Cell;
    units: number;
    type: Move_Type;
    arrow: SVGGElement;
}