import { useState, useReducer } from "react";
import { characterReducer, defaultCharacter, characterDataValidation } from "./Utils";

import PrimarySkills from "./Components/primarySkills";
import SecondarySkills from "./Components/secondarySkills";
import GeneralInfo from "./Components/generalInfo";
import BattleStats from "./Components/battleStats";
import HealthStats from "./Components/healthStats";
import SavingThrows from "./Components/savingThrows";
import HitdiceTracker from "./Components/hitdiceTracker";
import ExhaustionTracker from "./Components/exhaustionTracker";
import DeathSavesTracker from "./Components/deathSavesTracker";

import MagicalDebugButton from "./Components/magicalDebugButton";


export default function CharacterSheet(props) {
    const [characterData, characterDispatch] = useReducer( characterReducer, defaultCharacter, characterDataValidation );
    const [readOnly, setReadOnly] = useState(true);

    return (
        <div
            id="character-sheet"
            style={{
                "margin": "auto",
                "width": "890px",
                "display": "grid",
                "gridTemplateColumns": "repeat(12, 1fr)",
                "gridAutoRows": "25px",
                "columnGap": "10px",
                "rowGap": "10px",
            }}>

            <MagicalDebugButton
                placement={{"gridColumn": "1", "gridRow": "23/25"}}
                action={() => {setReadOnly(!readOnly)}}
                additive={" 1"}
            />
            <MagicalDebugButton
                placement={{"gridColumn": "2", "gridRow": "23/25"}}
                action={() => {console.log(characterData)}}
                additive={" 2"}
            />

            <GeneralInfo
                placement={{
                    "gridColumn": "1/-1",
                    "gridRow": "1/4",
                }}
                characterName={characterData.characterName}
                characterClass={characterData.characterClass}
                characterLevel={characterData.characterLevel}
                characterBackground={characterData.characterBackground}
                characterRace={characterData.characterRace}
                changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                    })}
                readOnly={readOnly}
            />
            <PrimarySkills
                placement={{
                    "gridColumn": "1/3",
                    "gridRow": "4/22",
                }}
                skills={characterData.primarySkills}
                readOnly={readOnly}
                changeHandler={(merge) => characterDispatch({
                    type: "change-text-field",
                    mergeObject: merge,
                    fieldName: "primarySkills",
                })}
            />
            <SecondarySkills
                placement={{
                    "gridColumn": "3/6",
                    "gridRow": "4/22",
                }}
                skills={characterData.primarySkills}
                proficiencies={characterData.proficiencies}
                proficiencyModifier={characterData.proficiencyModifier}
                readOnly={readOnly}
                changeHandler={
                    (prof, val) => characterDispatch({
                        type: "change-proficiency",
                        proficiency: prof,
                        newValue: val,
                    })
                }
            />
            <BattleStats
                placement={{
                    "gridColumn": "6/9",
                    "gridRow": "4/8",
                }}
                initiative={characterData.initiative}
                armorClass={characterData.armorClass}
                changeHandler={(merge) => characterDispatch({
                    type: "change-text-field",
                    mergeObject: merge,
                })}
                readOnly={readOnly}
            />
            <HealthStats
                placement={{
                    "gridColumn": "9/-1",
                    "gridRow": "4/8",
            }}/>
            <SavingThrows
                placement={{
                    "gridColumn": "6/8",
                    "gridRow": "8/11",
            }}/>
            <HitdiceTracker
                placement={{
                    "gridColumn": "8/10",
                    "gridRow": "8/11",
            }}/>
            <ExhaustionTracker
                placement={{
                    "gridColumn": "10/12",
                    "gridRow": "8/11",
            }}/>
            <DeathSavesTracker
                placement={{
                    "gridColumn": "7/9",
                    "gridRow": "11/14",
            }}/>

        </div>);
}