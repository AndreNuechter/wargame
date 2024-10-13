import { structure_builder_tmpl } from './dom-creations.js';
import { cell_info, cell_production_forecast, overall_production_forecast } from './dom-selections.js';
import { calculate_resource_production } from './game-objects/resources.js';
import game from './game-objects/game.js';
import STRUCTURES from './game-objects/structures.js';

export {
    setup_overall_production_forecast,
    setup_content_for_own_cell,
    setup_cell_info,
    make_resource_list,
    make_structure_builder_inputs,
    side_bar_input_handling
};

function setup_overall_production_forecast(resources, tax_rate) {
    overall_production_forecast.querySelector('ul').replaceChildren(...make_resource_list(resources));
    overall_production_forecast.querySelector('input').value = tax_rate;
    overall_production_forecast.classList.remove('hidden');
}

function setup_content_for_own_cell(resources, structure_builder_inputs) {
    // TODO enable turning population into other units (on cells w required structures)
    cell_production_forecast.querySelector('ul').replaceChildren(...make_resource_list(resources));
    cell_production_forecast.querySelector('fieldset').replaceChildren(...structure_builder_inputs);
    cell_production_forecast.classList.remove('hidden');
}

function setup_cell_info(hex_obj, { wood, stone, cloth, food }) {
    // TODO it sucks to create/discard this piece of dom repeatedly...it would be nicer to only set the values
    const supported_structures = Object.values(STRUCTURES)
        .filter((structure) => !structure.unsupported_biomes.includes(hex_obj.biome))
        .map(({ display_name }) => `<li>${display_name}</li>`)
        .join('');

    // TODO use lists instead of the divs!?
    cell_info.innerHTML = `
        <h2>Cell Info</h2>
        <div>Biome: ${hex_obj.biome.name}</div>
        <div>Movement modifier: ${hex_obj.biome.movement_speed}</div>
        <div>Pleasantness: ${hex_obj.biome.pleasantness}</div>
        ...
        <h3>Production</h3>
        <div>Wood: ${wood}</div>
        <div>Stone: ${stone}</div>
        <div>Cloth: ${cloth}</div>
        <div>Food: ${food}</div>
        <h3>Supported structures</h3>
        <ul>${supported_structures}</ul>
    `;
    cell_info.classList.remove('hidden');
}

function make_resource_list(resources) {
    return Object
        .entries(resources)
        .map(([resource, value]) => Object.assign(
            document.createElement('li'),
            { textContent: `${resource}: ${value}` }
        ));
}

/** Create a set of UI elements to build or deconstruct structures supported on the given cell's biome. */
function make_structure_builder_inputs(hex_obj) {
    return Object
        .entries(STRUCTURES)
        .filter(([, structure]) => !structure.unsupported_biomes.includes(hex_obj.biome))
        .map(([name, structure]) => {
            // NOTE we use lastElementChild here as structure_builder refers to a template and therefore is a doc-fragment
            const structure_builder = structure_builder_tmpl.cloneNode(true).lastElementChild;
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
                    ...make_resource_list(calculate_resource_production(
                        [hex_obj],
                        game.active_player.tax_rate
                    ))
                );
                // update total resources
                game.update_resource_display();
            });

            return structure_builder;
        });
}

// TODO the name is too general as it only handles taxes...
function side_bar_input_handling(game) {
    return ({ target }) => {
        if (target.name === 'tax_rate') {
            game.active_player.tax_rate = Number(target.value);
        }
    };
}