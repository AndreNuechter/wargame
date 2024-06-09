import './js-modules/service-worker-init.js';
import wakeLock from './js-modules/wakelock.js';
import { create_hex_map, reroll_map } from './js-modules/hex-grid/hex-grid.js';
import board_dimensions from './js-modules/map-generation/board-dimensions.js';
import {
    add_player_btn,
    board,
    cell_info,
    cell_production_forecast,
    config_game_form,
    coord_system_toggle_btn,
    end_turn_btn,
    overall_production_forecast,
    player_configs,
    player_setup,
    reroll_map_btn,
    selection_highlight,
    side_bar,
    start_game_form,
    start_game_overlay,
} from './js-modules/dom-selections.js';
import create_player, { calculate_resource_production, make_player_config } from './js-modules/player.js';
import game, { apply_savegame } from './js-modules/game.js';
import ROUND_PHASES from './js-modules/round-phases.js';
import { BIOMES } from './js-modules/map-generation/biomes.js';
import outline_hexregion from './js-modules/hex-grid/outline-hexregion.js';
import structures from './js-modules/structures.js';

// TODO add way to config map gen

// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase. at end of this phase: generate resources

let selected_cell = null;

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-savegame');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;
    start_game_overlay.showModal();

    wakeLock.request();

    if (previously_saved_game) {
        apply_savegame(game, game_data);
    } else {
        game.board = create_hex_map(board_dimensions, game.board);
    }
}, { once: true });

// save game before closing page
window.addEventListener('beforeunload', () => {
    wakeLock.release();

    // prevent saving incomplete state (ie when closing page while still in the game_config_form)
    if (game.players.length === 0) {
        localStorage.removeItem('wargame-savegame');
        return;
    }

    localStorage.setItem(
        'wargame-savegame',
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
            players: game.players.map(({ name, type, color }) => ({ name, type, color })),
            board: [...game.board.values()]
                .map(({
                    cx, cy, x, y, q, r, s,
                    biome: { name },
                    elevation,
                    humidity,
                    temperature,
                    owner_id
                }) => ({
                    cx,
                    cy,
                    x,
                    y,
                    q,
                    r,
                    s,
                    biome_name: name,
                    elevation,
                    humidity,
                    temperature,
                    owner_id
                }))
        })
    );
});

document.addEventListener('submit', (event) => event.preventDefault());

start_game_form.addEventListener('submit', (event) => {
    if (event.submitter.id === 'new-game-btn') {
        // if there's a prior save, reroll the map and delete players
        if (start_game_overlay.dataset.priorSave === 'true') {
            Object.assign(game, {
                round: 0,
                current_phase: ROUND_PHASES.land_grab.name,
                current_player_id: 0
            });
            game.board = reroll_map(game.board);
            game.clear_players();
        }

        // create player creation ui elements
        Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

        // switch to game-config
        start_game_overlay.classList.add('game-config');
    } else {
        // the continue-btn does nothing if there's no prior save
        if (start_game_overlay.dataset.priorSave === 'false') return;
        // continue game
        game.run();
        start_game_overlay.close();
    }
});

reroll_map_btn.addEventListener('click', () => {
    game.board = reroll_map(game.board);
});

end_turn_btn.addEventListener('click', () => {
    if (game.current_phase === ROUND_PHASES.land_grab.name) {
        // TODO let player know he needs to pick a non-sea starting position
        if (selected_cell === null) return;

        game.board.get(selected_cell).owner_id = game.current_player_id;
        game.active_player.cells = [game.board.get(selected_cell)];

        selected_cell = null;
    }

    game.next_turn();
});

config_game_form.addEventListener('submit', () => {
    // prevent duplicate names
    // TODO do this on input or change
    const duplicate_names = new Set();
    const name_inputs = [...config_game_form.querySelectorAll('.player-name-input')];

    name_inputs
        .reduce((name_count, { value }) => {
            name_count[value] = value in name_count
                ? name_count[value] + 1
                : 1;

            if (name_count[value] > 1) {
                duplicate_names.add(value);
            }

            return name_count;
        }, {});

    if (duplicate_names.size !== 0) {
        // TODO add message below input and show toast
        // add highlight to related input field
        name_inputs.forEach((input) => {
            if (duplicate_names.has(input.value)) {
                input.classList.add('invalid');
            }
        });
        return;
    }

    // TODO find better way to store colors
    const player_colors = ['tomato', 'rebeccapurple', 'gold', 'aquamarine', 'hotpink'];

    // create player objects
    game.players = Array.from(
        player_configs,
        (config, id) => {
            const name = config.querySelector('.player-name-input').value;
            const type = config.querySelector('.player-type-select-radio:checked').value;
            return create_player(name, type, player_colors[id]);
        }
    );

    // TODO use other config options

    game.run();
    start_game_overlay.close();
});

add_player_btn.addEventListener('click', () => {
    // allow at max 5 players
    if (player_configs.length === 5) return;

    make_player_config(player_configs.length + 1);
});

// delete player
player_setup.addEventListener('click', ({ target }) => {
    if (!target.closest('.delete-player-btn')) return;
    // enforce a minimum of at least 2 players
    if (player_configs.length === 2) return;

    // rm config
    target.closest('.player-config').remove();
    // rewrite names etc on other player-configs
    [...player_configs]
        .forEach((config, id) => {
            id = id + 1;
            Object.assign(
                config.querySelector('.player-name-input'),
                {
                    name: `player-${id}-name`,
                    value: `Player ${id}`
                }
            );
            config.querySelectorAll('.player-type-select-radio')
                .forEach((radio) => {
                    radio.name = `player-${id}-type`;
                });
        });
});

// prevent closing dialog wo making a choice (ie by pressing esc)
start_game_overlay.addEventListener('cancel', (event) => event.preventDefault());

function output_cell_info(hex_obj) {
    cell_info.textContent = JSON.stringify(
        hex_obj,
        // NOTE: `neighbors` is cyclic
        (key, value) => key === 'neighbors' ? undefined : value,
        4
    );
}

const game_phases = {
    [ROUND_PHASES.land_grab.name](hex_obj, cell_element) {
        if (hex_obj.owner_id === -1 && hex_obj.biome !== BIOMES.sea) {
            const cell_output = hex_obj.biome.resource_production;
            const supported_structures = Object.values(structures)
                .filter((structure) => !structure.unsupported_biomes.includes(hex_obj.biome))
                .map(({ display_name }) => `<li>${display_name}</li>`)
                .join('');
            selected_cell = cell_element;
            // highlight clicked cell and its neighbors
            cell_element.classList.add('clicked');
            outline_hexregion([...hex_obj.neighbors, hex_obj], 'white', selection_highlight);
            // show expected production (and other cell specific factoids) on the side
            cell_production_forecast.innerHTML = `
            <h2>Cell Info</h2>
            <div>Biome: ${hex_obj.biome.name}</div>
            <div>Movement modifier: ${hex_obj.biome.movement_speed}</div>
            <div>Pleasantness: ${hex_obj.biome.pleasantness}</div>
            ...
            <h3>Production</h3>
            <div>Wood: ${cell_output.wood}</div>
            <div>Stone: ${cell_output.stone}</div>
            <div>Cloth: ${cell_output.cloth}</div>
            <div>Food: ${cell_output.food}</div>
            <h3>Supported structures</h3>
            <ul>${supported_structures}</ul>
            `;
        } else {
            cell_production_forecast.replaceChildren();
        }
    },
    [ROUND_PHASES.development.name](hex_obj) {
        if (hex_obj.owner_id !== game.current_player_id) {
            const total_production = calculate_resource_production(
                game.active_player.cells,
                game.active_player.tax_rate
            );
            const total_production_list = Object
                .entries(total_production)
                .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                .join('');
            cell_production_forecast.replaceChildren();
            overall_production_forecast
                .innerHTML = `
                <h2>Empire Overview</h2>
                <h3>Population</h3>
                ...
                <h3>Production</h3>
                <ul>
                    ${total_production_list}
                </ul>
                <form>
                    <h3>Tax Rate</h3>
                    <input
                        type="range"
                        name="tax_rate"
                        min="0"
                        step="1"
                        value="${game.active_player.tax_rate}"
                    >
                </form>
                `;
        } else {
            const structure_builder_inputs = Object
                .entries(structures)
                // TODO add icon to toggle structure info
                .map(([name, structure]) => `
                <label>
                    <div class="label-text">${structure.display_name}: </div>
                    <input
                        type="number"
                        class="structure-builder"
                        name="${name}"
                        value="${hex_obj.structures.get(structure)}"
                        min="0"
                    >
                </label>`)
                .join('');
            const cell_output = calculate_resource_production(
                [hex_obj],
                game.active_player.tax_rate
            );
            const output_list = Object
                .entries(cell_output)
                .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                .join('');
            selected_cell = hex_obj;

            // TODO enable turning population into other units (on cells w required structures)
            overall_production_forecast.replaceChildren();
            cell_production_forecast.innerHTML = `
                <h2>Cell Overview</h2>
                <h3>Cell Output</h3>
                <ul>
                    ${output_list}
                </ul>
                <form>
                    <h3>Build Structures</h3>
                    ${structure_builder_inputs}
                </form>`;
        }
    }
};

board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell-wrapper');

    if (!cell_element) {
        selected_cell = null;
        return;
    }

    const previously_selected_cell = board.querySelector('.clicked');
    const hex_obj = game.board.get(cell_element);

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        // clear focus highlighting
        selection_highlight.replaceChildren();

        selected_cell = null;

        // player de-selected a cell
        if (previously_selected_cell === cell_element) return;
    }

    // TODO toggle debug via dblclick on title
    output_cell_info(hex_obj);

    game_phases[game.current_phase](hex_obj, cell_element);
});

side_bar.addEventListener('input', ({ target }) => {
    const entered_value = Number(target.value);

    if (target.name === 'tax_rate') {
        game.active_player.tax_rate = entered_value;
    } else if (target.classList.contains('structure-builder')) {
        const structure = structures[target.name];
        const structure_current_count = selected_cell.structures.get(structure);

        if (entered_value < 0) {
            // TODO keep user from entering values by keyboard...use other ui element
            target.value = structure_current_count;
            return;
        }

        const structure_cost = structures[target.name].construction_cost;
        const building_structure = entered_value > structure_current_count;

        if (building_structure) {
            const player_isnt_rich_enough = structure_cost
                .some(({ resource_name, amount }) => amount > game.active_player.resources[resource_name]);

            if (player_isnt_rich_enough) {
                target.value = structure_current_count;
                return;
            }

            // subtract resources
            structure_cost.forEach(({ resource_name, amount }) => {
                game.active_player.resources[resource_name] -= amount;
            });
        } else {
            // add resources
            structure_cost.forEach(({ resource_name, amount }) => {
                game.active_player.resources[resource_name] += amount;
            });
        }

        // update structure count on cell
        selected_cell.structures.set(structure, entered_value);
        // update cell production
        cell_production_forecast.querySelector('ul').innerHTML = (
            Object
                .entries(calculate_resource_production(
                    [selected_cell],
                    game.active_player.tax_rate
                ))
                .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                .join('')
        );
        // update total resources
        game.update_resource_display();
    }
});

coord_system_toggle_btn.addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});