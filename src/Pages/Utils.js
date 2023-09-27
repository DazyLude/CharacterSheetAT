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

export function characterReducer(oldData, action) {
    let newData;
    switch (action.type) {
        case "validate":
            newData = characterDataValidation(oldData);
            break;
        case "change-proficiency":
            newData = changeProficiency(oldData, action.proficiency, action.newValue);
            break;
        case "change-text-field":
            newData = changeField(oldData, action.mergeObject, action.fieldName);
            break;
        case "add-grid-element":
            newData = addGridElement(oldData, action.elementId, action.elementData, action.elementPlacement);
            break;
        case "remove-grid-element":
            newData = removeGridElement(oldData, action.elementId);
            break;
        case "change-grid-data":
            newData = changeGridData(oldData, action.merge, action.id);
            break;
        case "change-grid-element":
            newData = changeGridElement(oldData, action.merge, action.id);
            break;
        case "load-from-disk":
            console.log("loaded file from local storage");
            newData = characterDataValidation(action.data);
            break;
        case "add-set-item":
            console.log("adding array item")
            newData = addToSet(oldData, action.id, action.itemId, action.item);
            break;
        case "remove-set-item":
            newData = removeFromSet(oldData, action.id, action.itemId);
            break;
        case "replace-set-item":
            newData = replaceInSet(oldData, action.id, action.itemId, action.replacement);
            break;
        default:
            console.error("incorrect action type passed to characterReducer: " + action.type);
            break;
    }
    localStorage.setItem("characterData", JSON.stringify(newData));
    return newData;
}

function replaceInSet(oldData, id, itemId, replacement) {
    const newData = {...oldData};
    newData.gridElements[id].dataSet[itemId] = {...replacement};
    return newData;
}

function addToSet(oldData, id, itemId, item) {
    const newData = {...oldData};
    newData.gridElements[id].dataSet[itemId] = item;
    return newData;
}

function removeFromSet(oldData, id, itemId) {
    const newData = {...oldData};
    delete newData.gridElements[id].dataSet[itemId];
    return newData;
}

function addGridElement(oldData, id, data, placement) {
    const newData = {...oldData};
    newData.gridElements[id] ??= {};
    newData.gridElements[id] = {...newData.gridElements[id], ...data}
    newData.gridData[id] ??= {x: 1, y: 1, h: 1, w: 1};
    newData.gridData[id] = {...newData.gridData[id], ...placement};
    return newData;
}

function removeGridElement(oldData, id) {
    const newData = {...oldData};
    delete newData.gridElements[id];
    delete newData.gridData[id];
    return newData;
}

function changeGridData(oldData, replacementData, gridElementId) {
    const newData = {...oldData};
    newData.gridData[gridElementId] = {
        ...newData.gridData[gridElementId],
        ...replacementData,
    }
    return newData;
}

function changeGridElement(oldData, replacementData, gridElementId) {
    const newData = {...oldData};
    newData.gridElements[gridElementId] = {
        ...newData.gridElements[gridElementId],
        ...replacementData,
    }
    return newData;
}

function changeField(oldData, replacementData, fieldName = "") {
    if (fieldName !== "") {
        const newData = {
            ...oldData
        }
        newData[fieldName] = {
            ...newData[fieldName],
            ...replacementData,
        }
        return newData;
    }

    return {
        ...oldData,
        ...replacementData,
    };
}


function changeProficiency(oldData, proficiency, newValue) {
    const newData = {...oldData};
    newData.proficiencies[proficiency] = newValue;
    return newData;
}

export function characterDataValidation(characterData) {
    const validatedData = {...characterData};
    // General info check
    validatedData.characterName ??= "Lorem";
    validatedData.characterClass ??= "Ispum";
    validatedData.characterLevel ??= "Dolor";
    validatedData.characterBackground ??= "Sit";
    validatedData.characterRace ??= "Amet";
    // Primary skills check
    const primarySkillNames = ["str", "dex", "con", "int", "wis", "cha"];
    if (!("primarySkills" in validatedData)) {
        validatedData["primarySkills"] = {};
    }
    primarySkillNames.forEach(
        ps => {
            if (!(ps in validatedData["primarySkills"])) {
                validatedData["primarySkills"][ps] = 10;
            }
        }
    );
    // Proficiencies
    if (!("proficiencies" in validatedData)) {
        validatedData["proficiencies"] = {};
    }
    if (!("proficiencyModifier" in validatedData) ||
        typeof(validatedData["proficiencyModifier"]) !== "number"
    ) {
        validatedData["proficiencyModifier"] = 2;
    }
    // Death saving throws
    validatedData.deathSavingThrows ??= {};
    validatedData.deathSavingThrows.successes ??= 0;
    validatedData.deathSavingThrows.failures ??= 0;
    // Battle stats
    validatedData.armorClass ??= 10;
    validatedData.intiative ??= "+0";
    validatedData.hitDice ??= "0d0";
    validatedData.hitDiceTotal ??= "0";
    validatedData.exhaustion ??=  0;

    validatedData.gridData ??= {};

    validatedData.gridElements ??= {};

    return validatedData;
}

export const funnyConstants = {
    columnWidth: 65, // columns are 65px wide
    columnGap: 10,
    rowHeight: 25, // rows are 25px high
    rowGap: 10,
}