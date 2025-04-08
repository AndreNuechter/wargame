interface Board_dimensions {
    width: number;
    height: number;
}

interface Hex_Cell {
    owner_id: number;
    biome: Biome;
    cell: SVGGElement;
    resources: { [Key in Resource]: number };
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
    humidity: Humidity_Level;
    temperature: Temperature;
    pop_size_display: SVGTextElement;
    developable_land: number;
}

type Point = {
    x: number;
    y: number;
}

type Edge = [Point, Point]

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

interface Round_Phase {
    // TODO note possible values
    name: string;
    call_to_action: string;
    end_turn_btn_label: string;
    handle_click_on_cell: (arg0: Hex_Cell, arg1: Game) => void;
}

type Humidity_Level = "arid" | "dry" | "moderate" | "moist" | "wet";
type Humidity_Levels = { [Level in Humidity_Level]: Level };

type Temperature = "freezing" | "cold" | "temperate" | "warm" | "hot";
type Temperatures = { [Level in Temperature]: Level };

type Resource = "wood" | "stone" | "food" | "people" | "gold" | "alcohol" | "iron" | "coal";
type Gatherable_Resources = { [Key in "wood" | "stone" | "food"]?: number };
type Resources = { [Key in Resource]: Key };
// TODO can we find a better name?
type Resource_Output = { [Key in Resource]?: number };

// TODO can we get rid of this?
interface Resource_Amount {
    resource_name: string;
    amount: number;
}

type Biome_Name = "ice" | "sea" | "mountain" | "high_mountain" | "tundra" | "grassland" | "savanna" | "boreal_forest" | "forest" | "tropical_rainforest" | "cold_swamp" | "swamp" | "tropical_swamp" | "desert" | "extreme_desert";
// TODO can we be more specific? the value should be the Biome w the name === Key
// TODO same issue w structures
type Biomes = { [Key in Biome_Name]: Biome; };

interface Biome {
    name: Biome_Name;
    resource_production: Gatherable_Resources;
}

type Player_Type = "human" | "ai";
type Player_Types = { [Key in Player_Type]: Key };

interface Player {
    id: number;
    name: string;
    type: Player_Type;
    cells: Set<Hex_Cell>;
    add_cell: (cell: Hex_Cell) => void;
    delete_cell: (cell: Hex_Cell) => void;
    /** Returns the combined values from all the player's cells. */
    get resources(): Resource_Output;
    tax_rate: number;
    encampments: Map<Hex_Cell, number>;
    get_encampment: (cell: Hex_Cell) => number;
    add_encampment: (cell: Hex_Cell, units: number) => void;
    delete_encampment: (cell: Hex_Cell) => void;
    outline_encampments: () => void;
    border_path_container: SVGPathElement;
    /** Clean up the related svg paths. */
    destroy: () => void;
}

type Season = "spring" | "summer" | "autumn" | "winter";
type Seasons = { [Key in Season]: Key; };

type Structure_Name = "house" | "lumber_mill" | "quarry" | "forge" | "farm" | "distillery" | "mine";
type Structures = { [Key in Structure_Name]: Structure; };

interface Structure {
    display_name: string;
    construction_cost: Resource_Amount[];
    space_requirement: number;
    unsupported_biomes: Set<Biome>;
    // TODO refine effects
    effects: object;
    output: Resource_Amount[];
    input: Resource_Amount[];
    required_workers: number;
}

interface Army {
    player_id: number;
    unit_count: number;
    is_defender?: boolean;
    // TODO increase this ea turn and use this to give "prepared" army bonuses
    turns_on_cell?: number;
};

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
    /** The type of movement. */
    type: "settle" | "unspecified";
    /** The SVG element visualizing the move. */
    arrow: SVGGElement;
};

interface Movement_Planning_Form_Config {
    settle_cell: boolean;
    season: Season;
    min_value?: number;
    max_value?: number;
    current_value?: number;
};

type Move_Queue = Player_Move[];