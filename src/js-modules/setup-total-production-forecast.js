import { total_production_forecast } from './dom-selections.js';
import { make_resource_list } from './helper-functions.js';

export default setup_total_production_forecast;

/**
 * @param { Resource_Output } resources
 * @param {number} tax_rate
 */
function setup_total_production_forecast(resources, tax_rate) {
    total_production_forecast.querySelector('ul').replaceChildren(
        ...make_resource_list(resources),
    );
    total_production_forecast.querySelector('input').value = tax_rate.toString();
    total_production_forecast.classList.remove('hidden');
}