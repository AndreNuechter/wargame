/** The god-object holding most of the game state. */
interface Game {
    /** A map from DOM/SVG hex-cells to the objects defining them. */
    board: Map<SVGGElement, Hex_Cell>;
    round: number;
    current_phase: string;
    moves: Generator;
    /** Holds a reference to the player who has the turn. */
    active_player: Player;
    players: Player[];
    current_player_id: number;
    current_player_total_production: object | null;
    clear_players: () => void;
    update_resource_display: () => void;
    next_turn: () => void;
    run: () => void;
}

type Biome_Name = "ice" | "sea" | "mountain" | "high_mountain" | "tundra" | "grassland" | "savanna" | "boreal_forest" | "forest" | "tropical_rainforest" | "cold_swamp" | "swamp" | "tropical_swamp" | "desert" | "extreme_desert";

interface Biome {
    name: Biome_Name;
    resource_production: object;
}

// TODO can we be more specific? the value should be the Biome w the name === Key
type Biomes = {
    [Key in Biome_Name]: Biome;
};

interface Player {
    id: number;
    cells: Set<Hex_Cell>;
    tax_rate: number;
    encampments: Map<Hex_Cell, number>
}

type Move_Queue = Player_Move[]

type Season = "spring" | "summer" | "autumn" | "winter";

type Seasons = {
    [Key in Season]: Key;
};

type Resource = "people" | "wood" | "stone" | "food" | "alcohol" | "gold" | "cloth" | "iron";

type Resources = {
    [Key in Resource]: Key
};

interface Resource_Amount {
    resource_name: string;
    amount: number;
}

interface Structure {
    display_name: string;
    construction_cost: Resource_Amount[];
    space_requirement: number;
    unsupported_biomes: Biome[];
    // TODO refine effects
    effects: object;
    output: Resource_Amount[];
    input: Resource_Amount[];
    required_workers: number;
}

interface Hex_Cell {
    owner_id: number;
    biome: Biome;
    cell: SVGGElement;
    resources: object;
    structures: Map<Structure, number>;
    cx: number;
    cy: number;
    x: number;
    y: number;
    q: number;
    r: number;
    s: number;
    has_owner: boolean;
    neighbors: Hex_Cell[];
    elevation: number;
    // TODO refine humidity
    humidity: string;
    // TODO refine temp
    temperature: string;
    pop_size_display: SVGTextElement;
    developable_land: number;
}

type Move_Type = "settle" | "unspecified"

/** A move from one cell to another. */
interface Player_Move {
    /** The id/position of the player making the move. */
    player_id: number;
    /** One of the values [spring | summer | autumn | winter]. */
    season: Season;
    /** The hex-cell being moved from. */
    origin: Hex_Cell;
    /** The hex-cell being moved to. */
    target: Hex_Cell;
    /** The number of units sent. */
    units: number;
    /** The type of movement, one of [settle | unspecified]. */
    type: Move_Type;
    /** The SVG element visualizing the move. */
    arrow: SVGGElement;
}