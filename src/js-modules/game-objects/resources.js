import { make_frozen_null_obj } from '../helper-functions.js';

// NOTE resource storage is tied to cell to allow plundering, but all are pooled for use (except people for moves)
/** @type {Resources} */
const RESOURCES = make_frozen_null_obj({
    people: 'people', // population of cell grows ea round, as long as theres food, by 0-2, for every pair of people; if food is not enough, population decreases and chance of uprisings (no taxes, destruction of structures, no soldiers...) rises. needed for resource production (besides that of people), can be turned into soldiers.
    gold: 'gold', // gained by taxing population. taxation may increase chance of uprising. used for moving units
    cloth: 'cloth', // gained passively from cell and actively thru textile_factory. used for housing
    wood: 'wood', // cell, lumber_mills. housing, soldiers
    stone: 'stone', // cell, quarry. housing, soldiers
    iron: 'iron', // forge. soldiers, housing
    food: 'food', // cell, farm. used by pop
    alcohol: 'alcohol', // distillery. lowers chance of uprisings
    coal: 'coal' // mine. used in forge to make iron.
});
const initial_resources = make_frozen_null_obj({
    [RESOURCES.people]: 5,
    [RESOURCES.gold]: 5,
    [RESOURCES.cloth]: 25,
    [RESOURCES.wood]: 25,
    [RESOURCES.stone]: 25,
    [RESOURCES.iron]: 0,
    [RESOURCES.food]: 50,
    [RESOURCES.alcohol]: 5
});

export default RESOURCES;

export { initial_resources, update_player_resources, calculate_resource_production };

/**
 * Update the resources of the players at the beginning of a new round.
 * @param {Player[]} players
*/
function update_player_resources(players) {
    players.forEach(
        ({ cells, encampments, tax_rate }) => {
            // TODO handle homelessness (total_pop > total_housing_capacity)...only housed population helps w res production
            const { total_population, total_required_workers } = [...cells].reduce(
                (result, cell) => {
                    result.total_population += cell.resources[RESOURCES.people];
                    result.total_required_workers += [...cell.structures.entries()]
                        .reduce(
                            (required_workers, [structure, count]) =>
                                required_workers + structure.required_workers * count,
                            0
                        );
                    return result;
                },
                { total_population: 0, total_required_workers: 0 }
            );
            // we scale down output of structures when there arent enough workers
            const productivity_modifier = Math.min(1.0, total_population / total_required_workers);
            // TODO unemployment contributes to unhappiness in the population
            // const unemployment_rate = (total_population - total_required_workers) / total_population;
            // ea person consumes 1 food
            // TODO do units in encampments consume more food?
            let food_requirement = [...encampments.values()]
                .reduce((result, encamped_units) => result + encamped_units, total_population);

            cells.forEach((cell) => {
                // add default production
                Object.entries(cell.biome.resource_production)
                    .forEach(([resource, gain]) => {
                        cell.resources[resource] += gain;
                    });
                // add building based production
                // TODO consume resources needed for production
                [...cell.structures.entries()]
                    .forEach(([structure, count]) =>
                        structure.output.forEach(({ resource_name, amount }) => {
                            cell.resources[resource_name] += Math.trunc(amount * count * productivity_modifier);
                        })
                    );
                // collect taxes
                // TODO only tax housed and working population
                // TODO high taxes contribute to unhappiness in the population
                cell.resources[RESOURCES.gold] += cell.resources[RESOURCES.people] * tax_rate;

                // consume food
                if (food_requirement > 0) {
                    if (food_requirement >= cell.resources[RESOURCES.food]) {
                        food_requirement -= cell.resources[RESOURCES.food];
                        cell.resources[RESOURCES.food] = 0;
                    } else {
                        cell.resources[RESOURCES.food] -= food_requirement;
                        food_requirement = 0;
                    }
                }

                // TODO consume alc to decrease unhappiness!?
                // TODO decay some resources to prevent overstacking?
                // increase population
                increase_population(cell);
            });

            // TODO starvation contributes to unhappiness in the population
            // if (food_requirement > 0) {}
        }
    );
}

function increase_population(cell) {
    // TODO scale chances up/down based on how many neighboring cells are inhabited (and other factors like starvation)
    let population_increase = 0;

    // give tiny chance to gain 1 to cells w only 1 inhabitant
    if (cell.resources.people === 1) {
        if (Math.random() < 0.05) {
            population_increase = 1;
        }
    } else {
        const pair_count = Math.trunc(cell.resources.people / 2);

        for (let pair_index = 0; pair_index < pair_count; pair_index += 1) {
            const random_num = Math.random();

            // randomnly give 0 (50%), 1 (40%) or 2 (10%) new people
            if (random_num < 0.1) {
                population_increase += 2;
            } else if (random_num < 0.5) {
                population_increase += 1;
            }
        }
    }

    cell.resources[RESOURCES.people] += population_increase;
}

function calculate_resource_production(cells, tax_rate = 1) {
    const result = {
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
    });

    // calculate gold/taxes
    // TODO homelessness...only housed pop helps w res production, pays taxes and can be used for war
    result[RESOURCES.gold] = total_population * tax_rate;

    return result;
}