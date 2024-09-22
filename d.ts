// TODO find a way to have these descriptions show up in type-hints
/**
 * The god-object holding most of the game state.
 * @typedef {Object} game
 * @property {Map} board - A map from DOM/SVG hex-cells to the objects defining them.
 * @property {Number} round - A map from DOM/SVG hex-cells to the objects defining them.
 * @property {Object} active_player - Holds a reference to the player who has the turn.
 */
interface Game {
    board: Map<SVGGElement, Hex_Cell>;
    round: number;
    active_player: Player;
}

interface Player { }

type Move_Queue = Player_Move[]

type Season = "spring" | "summer" | "autumn" | "winter";

interface Hex_Cell {
    owner_id: number;
    resources: object;
    cell: SVGGElement;
    cx: number;
    cy: number;
}

type Move_Type = "settle" | "unspecified"

/**
 * A move from one cell to another.
 * @typedef {Object} Player_Move
 * @property {String} season - One of the values [spring | summer | autumn | winter].
 * @property {Hex_Cell} origin - The hex-cell being moved from.
 * @property {Hex_Cell} target - The hex-cell being moved to.
 * @property {Number} units - The number of units sent.
 * @property {String} type - The type of movement [settle | unspecified].
 * @property {SVGGeometryElement} arrow - The SVG element visualizing the move.
 */
interface Player_Move {
    player_id: number;
    season: Season;
    origin: Hex_Cell;
    target: Hex_Cell;
    units: number;
    type: Move_Type;
    arrow: SVGGElement;
}