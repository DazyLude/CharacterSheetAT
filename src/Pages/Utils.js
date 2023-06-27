export function getStatMod(value, otherModifiers = 0) {
    if (typeof(value) !== "number") {
        console.error(`value type must be a number:\nvalue: ${value}, type: ${typeof(value)}`);
        return 0;
    }
    if (typeof(otherModifiers) !== "number") {
        console.error(`otherModifiers type must be a number:\nvalue: ${otherModifiers}, type: ${typeof(otherModifiers)}`);
        otherModifiers = 0;
    }

    const modifier = Math.floor((value - 10)/2) + otherModifiers;
    if (modifier <= 0) {
        return modifier.toString();
    }
    return "+" + modifier;
}

export function characterReducer(oldData, action) {
    switch (action.type) {
        case "validate":
            return characterDataValidation(oldData);
        case "change-proficiency":
            return changeProficiency(oldData, action.proficiency, action.newValue);
        case "change-text-field":
            return changeField(oldData, action.mergeObject, action.fieldName);
        default:
            break;
    }
    console.error("incorrect action type passed to characterReducer");
    return oldData;
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
    validatedData.characterName = validatedData.characterName ?? "Lorem";
    validatedData.characterClass = validatedData.characterClass ?? "Ispum";
    validatedData.characterLevel = validatedData.characterLevel ?? "Dolor";
    validatedData.characterBackground = validatedData.characterBackground ?? "Sit";
    validatedData.characterRace = validatedData.characterRace ?? "Amet";
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
    return validatedData;
}

export const defaultCharacter = {
    "characterName": "Daino",
    "characterClass": "Artificier",
    "characterLevel": "8",
    "characterBackground": "Sage",
    "characterRace": "Gnome",
    "primarySkills": {
        "str": 8,
        "dex": 16,
        "con": 12,
        "int": 20,
        "wis": 14,
        "cha": 10,
    },
    "proficiencyModifier": 3,
    "proficiencies": {
        "acrobatics": 1,
        "arcana": 1,
        "history": 1,
        "medicine": 1,
        "perception": 1,
    },
    "health" : {
        "maxHp": 43,
        "currentHp": 43,
        "tempHp": 7,
    }
}