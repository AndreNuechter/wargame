import { make_frozen_null_obj } from '../helper-functions.js';

// NOTE resource storage is tied to cell to allow plundering, but all but people, are pooled
const RESOURCES = make_frozen_null_obj({
    people: 'people', // population of cell grows ea round, as long as theres food, by 0-2, for every pair of people; if food is not enough, population decreases and chance of uprisings (no taxes, destruction of structures, no soldiers...) rises. needed for resource production (besides that of people), can be turned into soldiers.
    gold: 'gold', // gained by taxing population. taxation may increase chance of uprising. used for moving units
    cloth: 'cloth', // gained passively from cell and actively thru textile_factory. used for housing
    wood: 'wood', // cell, lumber_mills. housing, soldiers
    stone: 'stone', // cell, quarry. housing, soldiers
    iron: 'iron', // forge. soldiers, housing
    food: 'food', // cell, farm. used by pop
    alcohol: 'alcohol', // distillery. lowers chance of uprisings
});

export default RESOURCES;

export const initial_resources = make_frozen_null_obj({
    [RESOURCES.people]: 5,
    [RESOURCES.gold]: 5,
    [RESOURCES.cloth]: 25,
    [RESOURCES.wood]: 25,
    [RESOURCES.stone]: 25,
    [RESOURCES.iron]: 0,
    [RESOURCES.food]: 50,
    [RESOURCES.alcohol]: 5
});

export function calculate_resource_production(cells, tax_rate = 1) {
    // TODO subtract food that's going to be used or decay
    const result = {
        [RESOURCES.people]: 0,
        [RESOURCES.gold]: 0,
        [RESOURCES.cloth]: 0,
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 0,
        [RESOURCES.iron]: 0,
        [RESOURCES.food]: 0,
        [RESOURCES.alcohol]: 0,
    };
    let total_population = 0;

    cells.forEach((cell) => {
        // TODO consume resources needed for production
        total_population += cell.resources.people;

        // add default production
        Object.entries(cell.biome.resource_production).forEach(([resource, gain]) => {
            result[resource] += gain;
        });

        // add construction based production
        [...cell.structures.entries()].forEach(([structure, count]) => {
            // TODO overemployment...lower production if total_population < total_required_workers
            structure.output.forEach(({ resource_name, amount }) => {
                result[resource_name] += amount * count;
            });
        });

        // calculate pop growth...this is not what we want to tell the player! that would be sth like "expect sth between 0 and Math.floor(cell.resources.people / 2) * 2"
        // TODO inc/dec pop growth based on how many neighboring cells are inhabited
        for (let pair_index = 0; pair_index < Math.floor(cell.resources.people / 2); pair_index += 1) {
            const random_num = Math.random();

            if (random_num < 0.3) {
                result[RESOURCES.people] += 2;
            } else if (random_num < 0.8) {
                result[RESOURCES.people] += 1;
            }
        }
    });

    // calculate gold/taxes
    // TODO homelessness...only housed pop helps w res production, pays taxes and can be used for war
    result[RESOURCES.gold] = total_population * tax_rate;

    return result;
}