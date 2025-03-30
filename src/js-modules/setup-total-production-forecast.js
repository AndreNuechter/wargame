import { total_production_forecast } from './dom-selections';
import { make_resource_list } from './helper-functions';

export default setup_total_production_forecast;

function setup_total_production_forecast(resources, tax_rate) {
    total_production_forecast.querySelector('ul').replaceChildren(
        ...make_resource_list(resources),
    );
    total_production_forecast.querySelector('input').value = tax_rate;
    total_production_forecast.classList.remove('hidden');
}