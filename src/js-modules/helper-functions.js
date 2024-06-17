export function is_even(num) {
    return num % 2 === 0;
}

export function is_num_between(num, lower, upper) {
    return num >= lower && num <= upper;
}

export function random_pick(list, min = 0, max = list.length) {
    return list[random_int(max, min)];
}

export function random_int(max, min = 0) {
    return Math.trunc(Math.random() * (max - min) + min);
}

export function make_frozen_null_obj(obj) {
    return Object.freeze(
        Object.assign(Object.create(null), obj)
    );
}

export function prevent_default_event_behavior(event) {
    event.preventDefault();
}