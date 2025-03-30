import { structure_builder_tmpl } from './dom-creations';
import { cell_production_forecast } from './dom-selections';
import { calculate_resource_production } from './game-objects/resources';
import STRUCTURES from './game-objects/structures';
import { make_resource_list } from './helper-functions';

export default make_structure_builder_inputs;

/** Create a set of UI elements to build or deconstruct structures supported on the given cell's biome. */
function make_structure_builder_inputs(hex_obj, game) {
    return Object
        .entries(STRUCTURES)
        .filter(([, structure]) => !structure.unsupported_biomes.has(hex_obj.biome))
        .map(([name, structure]) => {
            const structure_builder = /** @type {HTMLDivElement} */ (
                /** @type {DocumentFragment} */ (
                    structure_builder_tmpl.cloneNode(true)
                ).lastElementChild
            );
            const structure_label = structure_builder.querySelector('.label-text');
            const structure_count_display = structure_builder.querySelector('.structure-count');

            structure_builder.dataset.structure_name = name;
            structure_label.textContent = `${structure.display_name}: `;
            structure_count_display.textContent = hex_obj.structures.get(structure);

            // TODO optimize event-handlers...attach them once to the parent
            // structure_label.addEventListener('click', () => {
            //     // TODO show structure info...input, output, fx
            // });
            structure_builder.addEventListener('click', ({ target }) => {
                if (!(target instanceof Element)) return;

                // TODO apply effects
                const btn = target.closest('button');

                if (btn === null) return;

                const building_structure = btn.classList.contains('construct-structure-btn');
                const structure_cost = structure.construction_cost;
                let structure_count = hex_obj.structures.get(structure);

                // did the user click + or -?
                if (building_structure) {
                    // the cell is full
                    if (hex_obj.developable_land < structure.space_requirement) return;

                    const player_isnt_rich_enough = structure_cost
                        .some(({ resource_name, amount }) => amount > game.active_player.resources[resource_name]);

                    if (player_isnt_rich_enough) return;

                    structure_count += 1;
                    // consume resources
                    structure_cost.forEach(({ resource_name, amount }) => {
                        // loop over the players cells and consume resources until the price is paid
                        let remaining_cost = amount;

                        for (const cell of game.active_player.cells) {
                            const available_amount_of_resoure = cell.resources[resource_name];

                            if (available_amount_of_resoure < remaining_cost) {
                                remaining_cost -= available_amount_of_resoure;
                                cell.resources[resource_name] = 0;
                                continue;
                            } else {
                                cell.resources[resource_name] -= remaining_cost;
                                remaining_cost = 0;
                            }

                            if (remaining_cost === 0) break;
                        }
                    });

                    hex_obj.developable_land -= structure.space_requirement;
                } else {
                    if (structure_count === 0) return;

                    structure_count -= 1;
                    // give back resources
                    // TODO dont give back the entire cost when deconstructing structures build in prior rounds
                    structure_cost.forEach(({ resource_name, amount }) => {
                        hex_obj.resources[resource_name] += amount;
                    });

                    hex_obj.developable_land += structure.space_requirement;
                }

                // update structure count
                hex_obj.structures.set(structure, structure_count);
                structure_count_display.textContent = structure_count;
                // update cell production
                cell_production_forecast.querySelector('ul').replaceChildren(
                    ...make_resource_list(
                        calculate_resource_production(
                            [hex_obj],
                            game.active_player.tax_rate,
                        )),
                );
                // update total resources
                game.update_resource_display();
            });

            return structure_builder;
        });
}