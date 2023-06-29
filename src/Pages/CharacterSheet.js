import { useReducer, useContext } from "react";
import { characterReducer, defaultCharacter, characterDataValidation } from "./Utils";

import MagicalDebugButton from "./Components/magicalDebugButton";
import GridElement from "./Components/Grid/gridElement";
import { AppDispatchContext } from "./Components/appContext";
import { GridContext, GridContextReducer, gridContextReducer, initialGridContext } from "./Components/Grid/gridContext";

import MainSection from "./Sections/mainSection";


export default function CharacterSheet(props) {
    const [characterData, characterDispatch] = useReducer( characterReducer, defaultCharacter, characterDataValidation );
    const [gridContext, gridContextDispatch] = useReducer( gridContextReducer, initialGridContext );
    const contextDispatcher = useContext(AppDispatchContext);
    return (
        <GridContext.Provider value={gridContext}>
            <GridContextReducer.Provider value={gridContextDispatch}>
                <div
                    id="character-sheet"
                    style={{
                        "margin": "auto",
                        "width": "890px",
                        "display": "grid",
                        "gridTemplateColumns": "repeat(12, 65px)",
                        "gridAutoRows": "25px",
                        "columnGap": "10px",
                        "rowGap": "10px",
                        "gridAutoFlow": "column"
                    }}>
                    <GridElement id={"MagicalButton1"}>
                        <MagicalDebugButton
                            action={() => {contextDispatcher({type: "readOnly-switch"})}}
                            additive={" 1"}
                        />
                    </GridElement>
                    <GridElement id={"MagicalButton2"}>
                        <MagicalDebugButton
                            action={() => {console.log(characterData)}}
                            additive={" 2"}
                        />
                    </GridElement>
                    <GridElement id={"MagicalButton3"}>
                        <MagicalDebugButton
                            action={() => {contextDispatcher({type: "layoutEdit-switch"})}}
                            additive={" 3"}
                        />
                    </GridElement>
                    <MainSection characterData={characterData} characterDispatch={characterDispatch} />
                </div>
            </GridContextReducer.Provider>
        </GridContext.Provider>
        );
}