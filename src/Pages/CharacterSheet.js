import PrimarySkills from "./Components/primaryStatsColumn";
import GeneralInfo from "./Components/generalInfo";

function characterDataValidation(characterData) {
    const validatedData = {...characterData};
    // Primary skills check
    const primarySkillNames = ["str", "dex", "con", "int", "wis", "cha"];
    if (!("primarySkills" in characterData)) {
        characterData["primarySkills"] = {};
        validatedData["primarySkills"] = {};
    }
    primarySkillNames.forEach(
        ps => {
            if (!(ps in characterData["primarySkills"])) {
                validatedData["primarySkills"][ps] = 10;
            }
        }
    );
    return validatedData;
}

export default function CharacterSheet(props) {
    const characterData = characterDataValidation( {
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
        }
    } );

    return (
        <div
            id="character-sheet"
            style={{
                "margin": "auto",
                "width": "min(820px, 100%)",
                "display": "grid",
                "gridTemplateColumns": "repeat(12, 1fr)"
            }}>
            <GeneralInfo
                placement={{
                    "gridColumn": "1/-1",
                    "height": "100px"
                }}
                characterName={characterData.characterName ?? "Lorem"}
                characterClass={characterData.characterClass ?? "Ispum"}
                characterLevel={characterData.characterLevel ?? "Dolor"}
                characterBackground={characterData.characterBackground ?? "Sit"}
                characterRace={characterData.characterRace ?? "Amet"}
            />
            <PrimarySkills
                placement={{
                    "gridColumn": "1/3",
                }}
                skills={characterData.primarySkills}
            />
            <SecondarySkills />
        </div>);
}





function SecondarySkills(props) {
    return (
        <div
            id="secondary-skills"
            style={{
                "gridColumn": "3/6"
            }}
        >
        </div>
    );
}
