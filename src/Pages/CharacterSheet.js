import { useReducer, useEffect, useState, useCallback } from "react";
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

    useEffect(() => { // attempts to load character data from local storage
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
    }, [characterDispatch]);

    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [mousePosition, setMousePosition] = useState([0, 0]);
    const [movingElement, setMovingElement] = useState(undefined);
    const [resizingElement, setResizingElement] = useState({id: undefined, direction: undefined});
    const columnWidth = 65; // columns are 65px wide
    const columnGap = 10;
    const rowHeight = 25; // rows are 25px high
    const rowGap = 10;

    useEffect(
        () => { // tracks cursor position at all times
            const update = (e) => {
                setMouseX(e.x);
                setMouseY(e.y);
            }
            window.addEventListener('mousemove', update);
            window.addEventListener('touchmove', update);
            return () => {
                window.removeEventListener('mousemove', update);
                window.removeEventListener('touchmove', update);
            }
        },
        [setMouseX, setMouseY]
    )
    const gridReducer = useCallback((type, action) => {
        const {id} = action;
        switch (type) {
            case ("move"): // moves provided (by id) grid element by d(elta)x columns and d(elta)y rows
                const {dx, dy} = action;
                const {x, y} = characterData.gridData[id];
                let newX = x + (dx ?? 0);
                newX = newX < 0 ? 0 : newX;
                let newY = y + (dy ?? 0);
                newY = newY < 0 ? 0 : newY;
                characterDispatch({type: "change-grid-data", id, merge: {x: newX, y: newY}});
            break;
            case ("resize"):
                const {dh, dw} = action;
                const {h, w} = characterData.gridData[id];
                let newH = h + (dh ?? 0);
                newH = newH < 0 ? 0 : newH;
                let newW = w + (dw ?? 0);
                newW = newW < 0 ? 0 : newW;
                characterDispatch({type: "change-grid-data", id, merge: {h: newH, w: newW}});
            break;
            default:
                characterDispatch({type: "change-grid-data", ...action});
        }
    }, [characterData.gridData]);

    const gridEventHandler = (type, action) => {
        const {id} = action ?? {};
        switch(type) {
            case ("resizeStart"):
                let {direction} = action;
                setMousePosition([mouseX, mouseY]);
                setResizingElement({id, direction});
            break;
            case ("moveStart"):
                setMousePosition([mouseX, mouseY]);
                setMovingElement(id);
            break;
            case ("release"):
                setMovingElement(undefined);
                setResizingElement({id: undefined, direction: undefined});
            break;
            default:
        }
    }

    useEffect( // moves the clicked-on element
        () => {
            if (movingElement !== undefined) {
                const dx = Math.trunc((mouseX - mousePosition[0]) / (columnGap + columnWidth));
                const dy = Math.trunc((mouseY - mousePosition[1]) / (rowGap + rowHeight));
                if (dx !== 0) {
                    gridReducer("move", {id: movingElement, dx});
                    setMousePosition([mouseX, mousePosition[1]]);
                }
                if (dy !== 0) {
                    gridReducer("move", {id: movingElement, dy});
                    setMousePosition([mousePosition[0], mouseY]);
                }
            }
        },
        [mousePosition, setMousePosition, mouseX, mouseY, movingElement, gridReducer]
    )

    useEffect( // resizes provided (by id) grid element by delta in a provided direction (l(eft)/r(ight)/u(p)/d(down))
        () => {
            const {id, direction} = resizingElement;
            if (id !== undefined) {
                const dx = Math.trunc((mouseX - mousePosition[0]) / (columnGap + columnWidth));
                const dy = Math.trunc((mouseY - mousePosition[1]) / (rowGap + rowHeight));
                if (dy === 0) {}
                else if (direction.includes('u')) {
                    gridReducer("move", {id, dy});
                    gridReducer("resize", {id, dh: -dy});
                    setMousePosition([mousePosition[0], mouseY]);
                }
                else if (direction.includes('d')) {
                    gridReducer("resize", {id, dh: dy});
                    setMousePosition([mousePosition[0], mouseY]);
                }
                if (dx === 0) {}
                else if (direction.includes('l')) {
                    gridReducer("move", {id, dx});
                    gridReducer("resize", {id, dw: -dx});
                    setMousePosition([mouseX, mousePosition[1]]);
                }
                else if (direction.includes('r')) {
                    gridReducer("resize", {id, dw: dx});
                    setMousePosition([mouseX, mousePosition[1]]);
                }
            }
        },
        [mousePosition, setMousePosition, mouseX, mouseY, resizingElement, gridReducer]
    )

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
                            proficiencyModifier={characterData.proficiencyModifier}
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
            <GridContextReducer.Provider value={gridEventHandler}>
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
                            "gridTemplateColumns": `repeat(12, ${columnWidth}px)`,
                            "gridAutoRows": `${rowHeight}px`,
                            "columnGap": `${columnGap}px`,
                            "rowGap": `${rowGap}px`,
                            "gridAutoFlow": "column"
                        }}>
                        {gridElementsList}
                    </div>
                </div>
            </GridContextReducer.Provider>
        </GridContext.Provider>
    );
}