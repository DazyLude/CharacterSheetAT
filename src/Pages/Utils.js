import { invoke } from "@tauri-apps/api";

export function dispatcher({type, id, name, value}) {
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

function changeGlobal(value_name, new_value) {
    changeData(
        {value_type: "global", new_value, value_name},
        "character_data"
    );
}

function changeGrid(id, value_name, new_value) {
    changeData(
        {value_type: "grid", id, new_value, value_name},
        "character_data"
    );
}

function changeElement(id, value_name, new_value) {
    changeData(
        {value_type: "element", id, new_value, value_name},
        "character_data"
    );
}

function mergeGlobal(value_name, merge_object) {
    changeData(
        {value_type: "global", value_name, merge_object},
        "character_data"
    );
}

function mergeGrid(id, merge_object) {
    changeData(
        {value_type: "grid", id, merge_object},
        "character_data"
    );
}

function mergeElement(id, merge_object) {
    changeData(
        {value_type: "element", id, merge_object},
        "character_data"
    );
}

function mergeWithSet(id, item_name, merge_object) {
    changeData(
        {value_type: "element-set", id, value_name: item_name, merge_object},
        "character_data"
    );
}

function addToSet(id, item_name, new_value) {
    changeData(
        {value_type: "element-set", id, value_name: item_name, new_value},
        "character_data"
    );
}

function removeFromSet(id, item_name) {
    changeData(
        {value_type: "remove-set", id, value_name: item_name},
        "character_data"
    );
}

function removeById(id) {
    changeData(
        {value_type: "remove", id},
        "character_data"
    );
}

export function changeData(data, target) {
    invoke("change_data", {target: target ?? "", data: data ?? {}})
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

export function placementStringFromXYWH({x, y, w, h}) {
    return `${y} / ${x} / ${h === -1 ? -1 : y + h} / ${w === -1 ? -1 : x + w}`;
}

export function objectFromPlacementString(placementString) {
    let vars = placementString.split("/")
        .map((val) => {return parseInt(val)});
    return {
        x: vars[1],
        y: vars[0],
        w: vars[3] === -1 ? -1 : vars[3] - vars[1],
        h: vars[2] === -1 ? -1 : vars[2] - vars[0],
    };
}