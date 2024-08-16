import SEASONS from '../seasons';
import RESOURCES from '../resources';
import move_queue from '../move-queue';
import { phase_label } from '../../dom-selections';

// TODO find a way to save and continue movement execution...just lean on move_queue?

export function* execute_moves(game) {
    for (const season in SEASONS) {
        const moves_in_this_season = move_queue.filter((move) => season === move.season);

        // output season in top-bar instead of cta
        phase_label.textContent = `Move(s) in ${season}`;

        const move_targets = new Map();
        // TODO this can be inferred from move_targets (= entry w value.size gt 1)
        const conflict_sites = new Set();

        // visualize moves to be made this season
        for (const move of moves_in_this_season) {
            if (!is_move_still_possible(move, game)) {
                console.log('impossible');

                delete_move_from_queue(move, move_queue);
                delete_move_from_queue(move, moves_in_this_season);
                continue;
            }

            // delay
            yield 'init_move';

            // show arrow
            move.arrow.style.display = 'initial';
            // TODO animate arrow (head going from origin to target)

            // see if there will be a battle at target
            if (!move_targets.has(move.target)) {
                move_targets.set(move.target, new Set([move.player_id]));
            } else if (!move_targets.get(move.target).has(move.player_id)) {
                move_targets.get(move.target).add(move.player_id);
                conflict_sites.add(move.target);
            }
        }

        // wait for input when all moves are laid out
        yield 'moves_laid_out';

        for (const move of moves_in_this_season) {
            // TODO check if player wants to settle cell
            // TODO add delay...yield?
            // TODO hide array and animate that (butt going from origin to target)
            // if player owns target, increase its pop. else create/add to encampment there
            if (move.player_id === move.target.owner_id) {
                move.target.resources[RESOURCES.people] += move.units;
            } else {
                // TODO update/display troopsize on target
                game.players[move.player_id].encampments.set(
                    move.target,
                    game.players[move.player_id].encampments.get(move.target) || 0 + move.units
                );
            }

            delete_move_from_queue(move, move_queue);
        }

        // TODO make this save-friendly
        for (const battle_field of conflict_sites) {
            // wait for input before a battle starts
            yield 'battle_awaits';
            resolve_battle(battle_field);
        }
    }
}

function is_move_still_possible(move = {}, game) {
    const available_troops = move.origin.owner_id === move.player_id
        ? move.origin.resources[RESOURCES.people] - 1
        : game.players[move.player_id].encampments.get(move.origin);

    // TODO partial moves
    return move.units <= available_troops;
}

function delete_move_from_queue(move, queue = []) {
    const index = queue.findIndex((item) => item === move);

    if (index < 0) return;

    // TODO animate this (when move is made)
    queue[index].arrow.remove();

    queue.splice(index, 1);
}

function resolve_battle() {
    // TODO impl me
    // find involved armies sizes, loop: create pairing of enemies and for ea role dice...?
}