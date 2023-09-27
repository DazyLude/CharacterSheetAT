import { useReducer, useEffect, useState, useCallback, createElement } from "react";
import { characterReducer, characterDataValidation, funnyConstants } from "./Utils";

import GridElement from "./Components/Grid/gridElement";
import { GridContext, GridContextReducer, MousePositionContext } from "./Components/Grid/gridContext";

import CustomTextField from "./Components/customTextField";
import StatusBar from "./Components/statusBar";

import GeneralInfo from "./Components/SimpleUIElements/generalInfo";
import PrimarySkills from "./Components/SimpleUIElements/primarySkills";
import SecondarySkills from "./Components/SimpleUIElements/secondarySkills";
import BattleStats from "./Components/SimpleUIElements/battleStats";
import HealthStats from "./Components/SimpleUIElements/healthStats";
import DeathSavesTracker from "./Components/SimpleUIElements/deathSavesTracker";
import HitdiceTracker from "./Components/SimpleUIElements/hitdiceTracker";
import ExhaustionTracker from "./Components/SimpleUIElements/exhaustionTracker";
import ProficiencyModifier from "./Components/SimpleUIElements/proficiencyModifier";
import AbilitySaveDC from "./Components/SimpleUIElements/abilitySaveDC";
import Senses from "./Components/SimpleUIElements/senses";
import SavingThrows from "./Components/SimpleUIElements/savingThrows";
import Inventory from "./Components/inventory";
import SpellList from "./Components/spellList";

export default function CharacterSheet() {
    const [characterData, characterDispatch] = useReducer( characterReducer, {}, characterDataValidation );
    const [mousePosition, setMousePosition] = useState([0, 0]);

    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;

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


    useEffect(
        () => { // tracks cursor position at all times and sends it to other components through context
            const update = (e) => {
                setMousePosition([e.x, e.y]);
            }
            window.addEventListener('mousemove', update);
            window.addEventListener('touchmove', update);

            return () => {
                window.removeEventListener('mousemove', update);
                window.removeEventListener('touchmove', update);
            }
        },
        [setMousePosition]
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
            case ("resize"): // changes elements size (by id)
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

    const gridElements = {...characterData.gridElements};
    const getClassFromString = (typeString) => {
        const classLibrary = {
            "generalInfo" : GeneralInfo,
            "primarySkills" : PrimarySkills,
            "secondarySkills" : SecondarySkills,
            "battleStats" : BattleStats,
            "healthStats": HealthStats,
            "deathSavesTracker": DeathSavesTracker,
            "hitdiceTracker": HitdiceTracker,
            "exhaustionTracker": ExhaustionTracker,
            "savingThrowsStats": SavingThrows,
            "proficiencyModifierTracker": ProficiencyModifier,
            "abilitySaveDC": AbilitySaveDC,
            "sensesStats": Senses,
            "customTextField": CustomTextField,
            "inventory": Inventory,
            "spellList": SpellList,
        }
        return classLibrary[typeString] ?? "div";
    };
    const gridElementsList = Object.entries(gridElements).map(([key, val]) => {
        const id = key;
        const typeString = val.type;

        return (
            <GridElement key={id} id={id}>
                {createElement(getClassFromString(typeString), {characterDispatch, characterData, id})}
            </GridElement>
        );
    });

    return (
        <GridContext.Provider value={{...characterData.gridData}}>
            <GridContextReducer.Provider value={gridReducer}>
                <MousePositionContext.Provider value={mousePosition}>
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
                </MousePositionContext.Provider>
            </GridContextReducer.Provider>
        </GridContext.Provider>
    );
}