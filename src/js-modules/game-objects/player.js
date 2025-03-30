import { player_borders_container, player_configs, player_encampments, player_setup } from '../dom-selections.js';
import { player_border_path, player_config_tmpl } from '../dom-creations.js';
import RESOURCES from './resources.js';
import outline_hexregion from './board/outline-hexregion.js';
import storage_keys from './storage-keys.js';

/** @type { {[K in Player_Type]: Player_Type} } */
const PLAYER_TYPES = {
    human: 'human',
    ai: 'ai',
};
/** @type { Player[] } */
const players = [];
const min_player_count = 2;
const max_player_count = 5;

export default players;
export {
    add_player,
    delete_player,
    make_player,
    make_player_config,
    reapply_players,
    save_players,
};

function add_player() {
    if (player_configs.length === max_player_count) return;

    make_player_config(player_configs.length + 1);
}

function deduplicate_name(name) {
    const name_is_duplicate = players.some((player) => player.name === name);

    if (!name_is_duplicate) return name;

    const name_has_postfix = /^(?<name>.+)_(?<id>\d+)$/.exec(name);

    if (name_has_postfix === null) return deduplicate_name(`${name}_2`);

    return deduplicate_name(`${name_has_postfix.groups.name}_${(Number(name_has_postfix.groups.id) || 0) + 1}`);
}

function delete_player({ target }) {
    if (
        !(target instanceof Element) ||
            target.closest('.delete-player-btn') === null ||
            player_configs.length === min_player_count
    ) return;

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
                    value: `Player ${id}`,
                },
            );
            config.querySelectorAll('.player-type-select-radio')
                .forEach((/** @type {HTMLInputElement} */ radio) => {
                    radio.name = `player-${id}-type`;
                });
        });
}

/** Create a player.
 * @param {number} id
 * @param {string} name
 * @param {Player_Type} [type=PLAYER_TYPES.ai]
 * @param {any[]} [owned_cells=[]]
 * @param {any[]} [active_encampments=[]]
 * @returns {Player}
*/
function make_player(
    id,
    name = 'Player Name',
    type = PLAYER_TYPES.ai,
    owned_cells = [],
    active_encampments = [],
) {
    const cells = new Set(owned_cells);
    const border_outline = /** @type {SVGPathElement} */ (player_border_path.cloneNode(true));
    const encampment_outline = /** @type {SVGPathElement} */ (player_border_path.cloneNode(true));
    const encampments = new Map();
    const player_id = id + 1;
    const player_custom_prop = `var(--player-${player_id})`;

    player_borders_container.append(border_outline);
    player_encampments.append(encampment_outline);
    // outline player territory on load
    outline_hexregion(
        cells,
        border_outline,
        { color: player_custom_prop },
    );
    // re-apply encampments in a loop to have the other logic run too
    active_encampments.forEach(([cell, units]) => add_encampment(cell, units));

    function add_encampment(cell, units) {
        encampments.set(cell, units);

        if (cell.cell.classList.contains('contested')) return;

        if (cell.has_owner) {
            cell.cell.classList.add('contested');

            return;
        }

        const first_other_encamped_player = players
            .find((player) => player.id !== id && player.encampments.has(cell));

        if (first_other_encamped_player) {
            cell.cell.classList.add('contested');
            cell.pop_size_display.textContent = '';
            // this causes the other player to redraw their encampments wo this cell
            first_other_encamped_player.outline_encampments();

            return;
        }

        outline_encampments();
        // output size
        cell.pop_size_display.textContent = units.toString();
    }

    function outline_encampments() {
        outline_hexregion(
            new Set(
                [...encampments.keys()]
                    .filter(({ cell }) => !cell.classList.contains('contested')),
            ),
            encampment_outline,
            { color: player_custom_prop, stroked_outline: true },
        );
    }

    return {
        id,
        name: deduplicate_name(name),
        type,
        tax_rate: 1,
        get resources() {
            return [...cells].reduce((result, { resources }) => {
                Object.entries(resources).forEach(([resource, amount]) => {
                    result[resource] += amount;
                });

                return result;
            }, {
                [RESOURCES.people]: 0,
                [RESOURCES.gold]: 0,
                [RESOURCES.cloth]: 0,
                [RESOURCES.wood]: 0,
                [RESOURCES.stone]: 0,
                [RESOURCES.iron]: 0,
                [RESOURCES.food]: 0,
                [RESOURCES.alcohol]: 0,
                [RESOURCES.coal]: 0,
            });
        },
        border_path_container: border_outline,
        get cells() {
            return cells;
        },
        add_cell(cell) {
            cell.owner_id = id;
            cells.add(cell);
            outline_hexregion(
                cells,
                border_outline,
                { color: player_custom_prop },
            );
        },
        delete_cell(cell) {
            cells.delete(cell);
            cell.owner_id = -1;
            outline_hexregion(
                cells,
                border_outline,
                { color: player_custom_prop },
            );
        },
        get encampments() {
            return encampments;
        },
        get_encampment(cell) {
            return encampments.get(cell);
        },
        add_encampment,
        delete_encampment(cell) {
            encampments.delete(cell);
            outline_encampments();

            // rm size output
            if (
                cell.owner_id === -1 &&
                players.every((player) => !player.encampments.has(cell))
            ) {
                cell.pop_size_display.textContent = '';
            }
        },
        outline_encampments,
        destroy() {
            cells.clear();
            encampments.clear();
            border_outline.remove();
            encampment_outline.remove();
        },
    };
}

/** Create an UI element to config a player. */
function make_player_config(id) {
    const config = /** @type {HTMLDivElement} */ (player_config_tmpl.cloneNode(true));

    Object.assign(
        config.querySelector('.player-name-input'),
        {
            name: `player-${id}-name`,
            value: `Player ${id}`,
        },
    );
    config.querySelectorAll('.player-type-select-radio')
        .forEach((/** @type {HTMLInputElement} */ radio) => {
            radio.name = `player-${id}-type`;
        });

    player_setup.append(config);
}

function reapply_players(game) {
    const stored_players = JSON.parse(localStorage.getItem(storage_keys.players));
    const cells = [...game.board.values()];

    players.push(
        ...stored_players.map(
            ({ name, type, encampments }, id) => make_player(
                id,
                name,
                type,
                cells.filter((cell) => cell.owner_id === id),
                encampments.map(({ cx, cy, units }) => [
                    cells.find((cell) => cell.cx === cx && cell.cy === cy),
                    units,
                ]),
            ),
        ),
    );
}

function save_players() {
    localStorage.setItem(
        storage_keys.players,
        JSON.stringify(
            players.map(({ name, type, encampments }) => ({
                name,
                type,
                encampments: [...encampments.entries()]
                    .map(([{ cx, cy }, units]) => ({ cx, cy, units })),
            })),
        ),
    );
}