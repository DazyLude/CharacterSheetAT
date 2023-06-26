export function getStatMod(value) {
    if (typeof(value) !== "number") {
        console.error(`value passed to getStatMod function was not a number:\nvalue: ${value}, type: ${typeof(value)}`);
        return 0;
    }
    const modifier = Math.floor((value - 10)/2);
    if (modifier <= 0) {
        return modifier;
    }
    return "+" + modifier;
}