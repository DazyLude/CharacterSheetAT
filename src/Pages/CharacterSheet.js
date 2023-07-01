import { useReducer, useContext, useEffect } from "react";
import { characterReducer, characterDataValidation } from "./Utils";

import MagicalDebugButton from "./Components/magicalDebugButton";
import GridElement from "./Components/Grid/gridElement";
import { AppDispatchContext } from "./Components/appContext";
import { GridContext, GridContextReducer } from "./Components/Grid/gridContext";

import MainSection from "./Sections/mainSection";
import FileManipulation from "./Components/fileManipulation";

export default function CharacterSheet(props) {
    const [characterData, characterDispatch] = useReducer( characterReducer, {}, characterDataValidation );
    const gridReducer = (action) => {characterDispatch("change-grid-field", action)};

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

    const contextDispatcher = useContext(AppDispatchContext);

    return (
        <GridContext.Provider value={characterData.gridData}>
            <GridContextReducer.Provider value={gridReducer}>
                <FileManipulation characterDispatch={characterDispatch} characterData={characterData}/>
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