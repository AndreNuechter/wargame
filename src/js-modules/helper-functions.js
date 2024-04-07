export function is_even(num) {
    return num % 2 === 0;
}

export function random_pick(list, min = 0, max = list.length) {
    return list[
        Math.trunc(Math.random() * max + min)
    ];
}