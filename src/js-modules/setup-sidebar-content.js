import { cell_info, cell_production_forecast, overall_production_forecast } from './dom-selections.js';
import STRUCTURES from './game-objects/structures.js';

export function setup_overall_production_forecast(resources, tax_rate) {
    overall_production_forecast.querySelector('ul').replaceChildren(...make_resource_list(resources));
    overall_production_forecast.querySelector('input').value = tax_rate;
    overall_production_forecast.classList.remove('hidden');
}

export function setup_cell_production_forecast(resources, structure_builder_inputs) {
    // TODO enable turning population into other units (on cells w required structures)
    cell_production_forecast.querySelector('ul').replaceChildren(...make_resource_list(resources));
    cell_production_forecast.querySelector('fieldset').innerHTML = structure_builder_inputs;
    cell_production_forecast.classList.remove('hidden');
}

export function setup_cell_info(hex_obj, { wood, stone, cloth, food }) {
    const supported_structures = Object.values(STRUCTURES)
        .filter((structure) => !structure.unsupported_biomes.includes(hex_obj.biome))
        .map(({ display_name }) => `<li>${display_name}</li>`)
        .join('');

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

export function make_resource_list(resources) {
    return Object
        .entries(resources)
        .map(([resource, value]) => Object.assign(
            document.createElement('li'),
            { textContent: `${resource}: ${value}` }
        ));
}

export function make_structure_builder_inputs(hex_obj) {
    return Object
        .entries(STRUCTURES)
        // TODO toggle structure info on click on label
        // TODO keep user from entering values by keyboard...use other ui element
        // ... minus-btn, amount-display, plus-btn...change val by steps of 1 (maybe increase when holding or dblclicking). show amount in yellow when going below initial val and green when above
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
}