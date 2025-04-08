import SEASONS from '../seasons';
import RESOURCES from '../resources';
import move_queue from '../move-queue';
import { end_turn_btn, phase_label } from '../../dom-selections';
import { random_int, random_pick } from '../../helper-functions';

export { execute_moves };

/**
 * @param {Game} game
 */
function* execute_moves(game) {
    for (const season in SEASONS) {
        const moves_in_this_season = move_queue
            .filter((move) => season === move.season)
            .filter((move) => {
                // filter out impossible moves as the player may have lost troops on their way here
                const is_still_possible = is_move_still_possible(move, game);

                if (!is_still_possible) {
                    delete_move_from_queue(move, move_queue);
                }

                return is_still_possible;
            });

        if (moves_in_this_season.length === 0) continue;

        // TODO persist move_targets and planned_settlements
        /** @type {Set<Hex_Cell>} */
        const move_targets = new Set();
        /** @type {Map<Hex_Cell, Set<number>>} */
        const players_planning_to_settle = new Map();

        // output season in top-bar instead of cta
        phase_label.textContent = `Move(s) in ${season}`;
        // update btn text
        end_turn_btn.textContent = 'Show next move';

        // visualize moves to be made this season and move troops
        for (const move of moves_in_this_season) {
            // highlight origin
            move.origin.cell.classList.add('clicked');
            // show arrow
            // TODO animate arrow (head going from origin to target)
            move.arrow.style.display = 'initial';
            // remember target of move
            move_targets.add(move.target);

            // wait for input before making a move
            yield 'init_move';

            if (move.type === 'settle') {
                players_planning_to_settle.set(
                    move.target,
                    players_planning_to_settle.has(move.target)
                        ? players_planning_to_settle.get(move.target).add(move.player_id)
                        : new Set([move.player_id]),
                );
            }

            move_units_from_origin_to_target(move, game);
            // FIXME this deletes the arrow too early...rm moves of moves_in_this_season in bulk after battle resolution?
            delete_move_from_queue(move, move_queue);
            move.origin.cell.classList.remove('clicked');
        }

        // wait for input when all moves are laid out
        end_turn_btn.textContent = 'Make these moves';
        yield 'moves_laid_out';

        for (const move_target of move_targets) {
            const armies = get_armies_at_cell(move_target, game.players);

            // check for conflict (= there're more than one player's troops at target)
            if (armies.length === 1) {
                const { player_id, unit_count } = armies[0];

                // give cell to player if they wanted to settle it
                if (players_planning_to_settle.get(move_target)?.has(player_id)) {
                    // FIXME cell is first marked as encamped
                    take_ownership_of_cell(game.players[player_id], move_target, unit_count);
                }

                continue;
            }

            // wait for input before a battle
            end_turn_btn.textContent = 'Start battle';
            yield 'battle_awaits';

            resolve_battle(
                move_target,
                armies,
                game.players,
                players_planning_to_settle.get(move_target),
            );
        }
    }
}

/**
 * @param {Player} player
 * @param {Hex_Cell} cell
 * @param {number} population
 */
function take_ownership_of_cell(player, cell, population) {
    player.delete_encampment(cell);
    player.add_cell(cell);
    cell.resources[RESOURCES.people] = population;
}

/**
 * @param {Player_Move} move
 * @param {Game} game
 */
function move_units_from_origin_to_target(move, game) {
    // decrease population/encampment-size on origin
    if (move.player_id === move.origin.owner_id) {
        move.origin.resources[RESOURCES.people] -= move.units;
    } else {
        const player = game.players[move.player_id];
        const new_encampment_size = player.get_encampment(move.origin) - move.units;

        if (new_encampment_size === 0) {
            player.delete_encampment(move.origin);
        } else {
            player.add_encampment(
                move.origin,
                new_encampment_size,
            );
        }
    }

    // increase population/encampment-size on target
    if (move.player_id === move.target.owner_id) {
        move.target.resources[RESOURCES.people] += move.units;
    } else {
        const player = game.players[move.player_id];
        const new_encampment_size = (player.get_encampment(move.target) || 0) + move.units;

        // FIXME cell may show units in wrong player color
        player.add_encampment(
            move.target,
            new_encampment_size,
        );
    }
}

/**
 * @param {Player_Move} move
 * @param {Game} game
 * @returns {boolean}
 */
function is_move_still_possible(move, game) {
    const available_troops = move.origin.owner_id === move.player_id
        ? move.origin.resources[RESOURCES.people] - 1
        : game.players[move.player_id].encampments.get(move.origin);

    // TODO enable partial moves
    return move.units <= available_troops;
}

/**
 * @param {Player_Move} move
 * @param {Move_Queue} queue
 */
function delete_move_from_queue(move, queue) {
    const index = queue.findIndex((item) => item === move);

    if (index < 0) return;

    // TODO possibly hide arrow and animate that (butt going from origin to target)
    queue[index].arrow.remove();

    queue.splice(index, 1);
}

/**
 * @param {Hex_Cell} cell
 * @param {Player[]} players
 * @returns {Army[]}
 */
function get_armies_at_cell(cell, players) {
    return players
        .reduce((result, player, player_id) => {
            if (player.encampments.has(cell)) {
                result.push({
                    player_id,
                    unit_count: player.encampments.get(cell),
                });
            } else if (player_id === cell.owner_id) {
                result.push({
                    player_id: cell.owner_id,
                    unit_count: cell.resources[RESOURCES.people],
                    is_owner: true,
                });
            }

            return result;
        }, []);
}

/**
 * @param {Hex_Cell} battle_field
 * @param {Army[]} armies
 * @param {Player[]} players
 * @param {Set<number>} players_wanting_to_settle
 */
function resolve_battle(battle_field, armies, players, players_wanting_to_settle) {
    // let armies fight until there's only one left
    // TODO stop after fixed # of iterations to model sieges that may span multiple years?!
    while (armies.length > 1) {
        const attacks = [];
        const losing_armies = new Set();

        // TODO give def bonus to owner
        // ea army attacks ea other w a random attack_strength between 0 and unit-count
        armies.forEach((attacker_army, attacker_id) => {
            // init fought_enemies w the current army's id so it doesnt fight itself
            const fought_enemies = new Set([attacker_id]);
            let previous_attack;

            // TODO victim should be randomn as to not hit earlier players unfairly harder
            armies.forEach((_, defender_id) => {
                if (fought_enemies.has(defender_id)) return;

                fought_enemies.add(defender_id);

                // TODO allow player to learn techniques that modulate this?!
                previous_attack = previous_attack === undefined
                    ? random_int(attacker_army.unit_count)
                    : random_int(attacker_army.unit_count - previous_attack);

                attacks.push({ target_id: defender_id, attack_strength: previous_attack });
            });
        });

        // attacks are "pre-recorded" so that ea player gets a shot
        for (const { target_id, attack_strength } of attacks) {
            armies[target_id].unit_count -= attack_strength;

            if (armies[target_id].unit_count <= 0) {
                losing_armies.add(target_id);
            }
        }

        // ensure there's a survivor, by picking a random one if all players lost
        if (losing_armies.size === armies.length) {
            // the random winner will possibly get the encampment again further on
            losing_armies
                .forEach(
                    (army_id) => players[armies[army_id].player_id].delete_encampment(battle_field),
                );
            armies = [Object.assign(random_pick(armies), { unit_count: 1 })];
            break;
        }

        // go over ids of losers in descending order (to not mess w the indices) and splice them out
        [...losing_armies]
            .sort((a, b) => b - a)
            .forEach((army_id) => {
                players[armies[army_id].player_id].delete_encampment(battle_field);
                armies.splice(army_id, 1);
            });
    }

    // the conflict is resolved, so the highlighting can be removed
    battle_field.cell.classList.remove('contested');

    const { player_id: winner_id, unit_count: surviving_units } = armies[0];
    const winner = players[winner_id];

    // owner won, update the population
    if (battle_field.owner_id === winner_id) {
        battle_field.resources[RESOURCES.people] = surviving_units;

        return;
    }

    // owner lost, take the cell from them and mark it as uninhabited
    if (battle_field.has_owner) {
        players[battle_field.owner_id].delete_cell(battle_field);
        battle_field.resources[RESOURCES.people] = 0;
    }

    // give the cell to the winner or update the encampment
    if (players_wanting_to_settle?.has(winner_id)) {
        take_ownership_of_cell(winner, battle_field, surviving_units);
    } else {
        winner.add_encampment(battle_field, surviving_units);
    }
}