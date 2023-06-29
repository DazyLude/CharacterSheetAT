import GridElement from "../Components/Grid/gridElement";

import PrimarySkills from "../Components/primarySkills";
import SecondarySkills from "../Components/secondarySkills";
import GeneralInfo from "../Components/generalInfo";
import BattleStats from "../Components/battleStats";
import HealthStats from "../Components/healthStats";
import SavingThrows from "../Components/savingThrows";
import HitdiceTracker from "../Components/hitdiceTracker";
import ExhaustionTracker from "../Components/exhaustionTracker";
import DeathSavesTracker from "../Components/deathSavesTracker";

export default function MainSection({characterData, characterDispatch}) {
    return (
        <>
            <GridElement id="GeneralInfo">
                <GeneralInfo
                    characterName={characterData.characterName}
                    characterClass={characterData.characterClass}
                    characterLevel={characterData.characterLevel}
                    characterBackground={characterData.characterBackground}
                    characterRace={characterData.characterRace}
                    changeHandler={(merge) => characterDispatch({
                            type: "change-text-field",
                            mergeObject: merge,
                        })}
                />
            </GridElement>
            <GridElement id="PrimarySkills">
                <PrimarySkills
                    skills={characterData.primarySkills}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                        fieldName: "primarySkills",
                    })}
                />
            </GridElement>
            <GridElement id="SecondarySkills">
                <SecondarySkills
                    skills={characterData.primarySkills}
                    proficiencies={characterData.proficiencies}
                    proficiencyModifier={characterData.proficiencyModifier}
                    changeHandler={
                        (prof, val) => characterDispatch({
                            type: "change-proficiency",
                            proficiency: prof,
                            newValue: val,
                        })
                    }
                />
            </GridElement>
            <GridElement id="BattleStats">
                <BattleStats
                    initiative={characterData.initiative}
                    armorClass={characterData.armorClass}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                    })}
                />
            </GridElement>
            <GridElement id="HealthStats">
                <HealthStats
                    health={{...characterData.health}}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                        fieldName: "health",
                    })}
                />
            </GridElement>
            <GridElement id="DeathSavesTracker">
                <DeathSavesTracker
                    successes={characterData.deathSavingThrows.successes}
                    failures={characterData.deathSavingThrows.failures}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                        fieldName: "deathSavingThrows",
                    })}
                />
            </GridElement>
            <GridElement id="HitdiceTracker">
                <HitdiceTracker
                    hitDice={characterData.hitDice}
                    hitDiceTotal={characterData.hitDiceTotal}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                    })}
                />
            </GridElement>
            <GridElement id="ExhaustionTracker">
                <ExhaustionTracker
                    exhaustion={characterData.exhaustion}
                    changeHandler={(merge) => characterDispatch({
                        type: "change-text-field",
                        mergeObject: merge,
                    })}
                />
            </GridElement>
            <GridElement id="SavingThrows">
                <SavingThrows />
            </GridElement>
        </>
    );
}