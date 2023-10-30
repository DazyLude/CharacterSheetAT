import { invoke } from "@tauri-apps/api";

export function dispatcher({type, id, name, value}) {
    console.log("called dispatcher")
    switch(type) {
        case "global":
            changeGlobal(name, value);
            break;
        case "grid":
            changeGrid(id, name, value);
            break;
        case "element":
            changeElement(id, name, value);
            break;
        case "global-merge":
            mergeGlobal(name, {...value});
            break;
        case "grid-merge":
            mergeGrid(id, {...value});
            break;
        case "element-merge":
            mergeElement(id, {...value});
            break;
        case "element-set-merge":
            mergeWithSet(id, name, {...value});
            break;
        case "element-set-add":
            addToSet(id, name, value);
            break;
        case "element-set-remove":
            removeFromSet(id, name);
            break;
        case "remove":
            removeById(id);
            break;
        default:
            console.error("unknown dispatch type: " + type);
    }
}


export function changeGlobal(value_name, new_value) {
    invoke("change_data", {payload: {value_type: "global", new_value, value_name}})
        .catch((e) => console.error(e));
}

export function changeGrid(id, value_name, new_value) {
    invoke("change_data", {payload: {value_type: "grid", id, new_value, value_name}})
        .catch((e) => console.error(e));
}

export function changeElement(id, value_name, new_value) {
    invoke("change_data", {payload: {value_type: "element", id, new_value, value_name}})
        .catch((e) => console.error(e));
}

export function mergeGlobal(value_name, merge_object) {
    if (typeof(merge_object) !== 'object') {
        console.error("merge methods accept objects as values only");
    }
    invoke("change_data", {payload: {value_type: "global", value_name, merge_object}})
        .catch((e) => console.error(e));
}

export function mergeGrid(id, merge_object) {
    if (typeof(merge_object) !== 'object') {
        console.error("merge methods accept objects as values only");
    }
    invoke("change_data", {payload: {value_type: "grid", id, merge_object}})
        .catch((e) => console.error(e));
}

export function mergeElement(id, merge_object) {
    if (typeof(merge_object) !== 'object') {
        console.error("merge methods accept objects as values only");
    }
    invoke("change_data", {payload: {value_type: "element", id, merge_object}})
        .catch((e) => console.error(e));
}

export function mergeWithSet(id, item_name, merge_object) {
    if (typeof(merge_object) !== 'object') {
        console.error("merge methods accept objects as values only");
    }
    invoke("change_data", {payload: {value_type: "element-set", id, value_name: item_name, merge_object}})
        .catch((e) => console.error(e));
}

export function addToSet(id, item_name, new_value) {
    invoke("change_data", {payload: {value_type: "element-set", id, value_name: item_name, new_value}})
        .catch((e) => console.error(e));
}

export function removeFromSet(id, item_name) {
    invoke("change_data", {payload: {value_type: "remove-set", id, value_name: item_name}})
        .catch((e) => console.error(e));
}

export function removeById(id) {
    invoke("change_data", {payload: {value_type: "remove", id}})
        .catch((e) => console.error(e));
}

export function getStatMod(value, otherModifiers = 0) {
    if (typeof(value) !== "number") {
        return 0;
    }
    if (typeof(otherModifiers) !== "number") {
        otherModifiers = 0;
    }

    const modifier = Math.floor((value - 10)/2) + otherModifiers;
    if (modifier <= 0) {
        return modifier.toString();
    }
    return "+" + modifier;
}

export function getStatModNumeric(value, otherModifiers) {
    if (typeof(value) !== "number") {
        return 0;
    }
    if (typeof(otherModifiers) !== "number") {
        otherModifiers = 0;
    }
    const modifier = Math.floor((value - 10)/2) + otherModifiers;
    return modifier;
}

export const funnyConstants = {
    columnWidth: 65, // columns are 65px wide
    columnGap: 10,
    rowHeight: 25, // rows are 25px high
    rowGap: 10,
}