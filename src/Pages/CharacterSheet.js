import { useReducer, useEffect } from "react";
import { characterReducer, characterDataValidation } from "./Utils";

import GridElement from "./Components/Grid/gridElement";
import { GridContext, GridContextReducer } from "./Components/Grid/gridContext";

import CustomTextField from "./Components/customTextField";
import StatusBar from "./Components/statusBar";

import GeneralInfo from "./Components/generalInfo";
import PrimarySkills from "./Components/primarySkills";
import SecondarySkills from "./Components/secondarySkills";
import BattleStats from "./Components/battleStats";
import HealthStats from "./Components/healthStats";
import DeathSavesTracker from "./Components/deathSavesTracker";
import HitdiceTracker from "./Components/hitdiceTracker";
import ExhaustionTracker from "./Components/exhaustionTracker";
import ProficiencyModifier from "./Components/proficiencyModifier";
import AbilitySaveDC from "./Components/abilitySaveDC";
import Senses from "./Components/senses";
import SavingThrows from "./Components/savingThrows";
import Inventory from "./Components/inventory";
import SpellList from "./Components/spellList";

export default function CharacterSheet() {
    const [characterData, characterDispatch] = useReducer( characterReducer, {}, characterDataValidation );

    const gridReducer = (action) => {characterDispatch({type: "change-grid-data", ...action})};
    useEffect(() => {
        const loadData = localStorage.getItem('characterData');
        if (loadData !== null) {
            let parsedData;
            try {
                parsedData = JSON.parse(loadData);
            }
            catch {
                return;
            }
            finally {
                characterDispatch({type: "load-from-disk", data: parsedData});
            }
        }
    }, []);

    const gridElements = {...characterData.gridElements};

    const gridElementsList = Object.entries(gridElements).map(([key, val]) => {
        const id = key;
        const type = val.type;
        switch(type) {
            case "generalInfo":
                return (
                    <GridElement key={id} id={id}>
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
                );
            case "primarySkills":
                return (
                    <GridElement key={id} id={id}>
                        <PrimarySkills
                            skills={characterData.primarySkills}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                                fieldName: "primarySkills",
                            })}
                        />
                    </GridElement>
                );
            case "secondarySkills":
                return (
                    <GridElement key={id} id={id}>
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
                    </GridElement>);
            case "battleStats":
                return (
                    <GridElement key={id} id={id}>
                        <BattleStats
                            initiative={characterData.initiative}
                            armorClass={characterData.armorClass}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                            })}
                        />
                    </GridElement>
                );
            case "healthStats":
                return (
                    <GridElement key={id} id={id}>
                        <HealthStats
                            health={{...characterData.health}}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                                fieldName: "health",
                            })}
                        />
                    </GridElement>
                );
            case "deathSavesTracker":
                return (
                    <GridElement key={id} id={id}>
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
                );
            case "hitdiceTracker":
                return (
                    <GridElement key={id} id={id}>
                        <HitdiceTracker
                            hitDice={characterData.hitDice}
                            hitDiceTotal={characterData.hitDiceTotal}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                            })}
                        />
                    </GridElement>
                );
            case "exhaustionTracker":
                return (
                    <GridElement key={id} id={id}>
                        <ExhaustionTracker
                            exhaustion={characterData.exhaustion}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                            })}
                        />
                    </GridElement>
                );
            case "savingThrowsStats":
                return (
                    <GridElement key={id} id={id}>
                        <SavingThrows
                            skills={characterData.primarySkills}
                            proficiencies={characterData.proficiencies}
                            proficiencyModifier={characterData.proficiencyModifier}
                            dispatcher={
                                (prof, val) => characterDispatch({
                                    type: "change-proficiency",
                                    proficiency: prof,
                                    newValue: val,
                                })
                            }
                            textFieldValue={characterData.savingThrowsModifiers}
                            textFieldHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                            })}
                        />
                    </GridElement>
                );
            case "proficiencyModifierTracker":
                return (
                    <GridElement key={id} id={id}>
                        <ProficiencyModifier
                            proficiencyModifier={characterData.proficiencyModifier}
                            changeHandler={(merge) => characterDispatch({
                                type: "change-text-field",
                                mergeObject: merge,
                            })}
                        />
                    </GridElement>
                );
            case "abilitySaveDC":
                return (
                    <GridElement key={id} id={id}>
                        <AbilitySaveDC
                            proficiencyModifier={characterData.proficiencyModifier}
                            skills={characterData.primarySkills}
                        />
                    </GridElement>
                );
            case "sensesStats":
                return (
                    <GridElement key={id} id={id}>
                        <Senses
                            skills={characterData.primarySkills}
                            proficiencies={characterData.proficiencies}
                            modifier={characterData.proficiencyModifier}
                        />
                    </GridElement>
                );
            case "customTextField":
                return (
                    <GridElement key={id} id={id}>
                        <CustomTextField
                            bodyText={val.bodyText}
                            bodyChangeHandler={(value) => {
                                characterDispatch({type: "change-grid-element", merge: {bodyText: value}, id: id})
                            }}
                            titleText={val.titleText}
                            titleChangeHandler={(value) => {
                                characterDispatch({type: "change-grid-element", merge: {titleText: value}, id: id})
                            }}
                        />
                    </GridElement>
                );
            case "inventory":
                return (
                    <GridElement key={id} id={id}>
                        <Inventory
                            skills={characterData.primarySkills}
                            data={characterData.gridElements[id]}
                            dispatcher={(args) => {characterDispatch({id: id, ...args})}}
                        />
                    </GridElement>
                );
            case "spellList":
                return (
                    <GridElement key={id} id={id}>
                        <SpellList
                            skills={characterData.primarySkills}
                            data={characterData.gridElements[id]}
                            dispatcher={(args) => {characterDispatch({id: id, ...args})}}
                        />
                    </GridElement>
                );
            default:
                return null;
        }
    });

    return (
        <GridContext.Provider value={{...characterData.gridData}}>
            <GridContextReducer.Provider value={gridReducer}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 890px 1fr",
                }}
                >
                    <StatusBar characterData={characterData} characterDispatch={characterDispatch} />
                    <div
                        id="character-sheet"
                        style={{
                            "gridColumn": "2",
                            "margin": "auto",
                            "width": "100%",
                            "display": "grid",
                            "gridTemplateColumns": "repeat(12, 65px)",
                            "gridAutoRows": "25px",
                            "columnGap": "10px",
                            "rowGap": "10px",
                            "gridAutoFlow": "column"
                        }}>
                        {gridElementsList}
                    </div>
                </div>
            </GridContextReducer.Provider>
        </GridContext.Provider>
    );
}