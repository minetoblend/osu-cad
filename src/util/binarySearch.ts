export function binarySearch<T>(hayStack: T[], getter: (t: T) => number, needle: number): { found: boolean, index: number } {
    let index = 0
    let left = 0;
    let right = hayStack.length - 1;
    while (left <= right) {
        index = left + ((right - left) >> 1);
        let value = getter(hayStack[index]);
        if (Math.abs(value - needle) < 0.0001)
            return {found: true, index};

        else if (value < needle)
            left = index + 1;
        else right = index - 1;
    }
    index = left;
    return {found: false, index};
}

export function binarySearchCorrected<T>(hayStack: T[], getter: (t: T) => number, needle: number) {
    let {found, index} = binarySearch(hayStack, getter, needle);
    if (!found && index > 0)
        index--;
    return {index, value: hayStack[index]};
}
