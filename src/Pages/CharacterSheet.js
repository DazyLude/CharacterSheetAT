import { useReducer, useContext, useEffect } from "react";
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
    }, [])

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
                    <GridElement id={"MagicalButton4"}>
                        Choose a file:
                        <input type="file" id="file-selector" accept="application/json"/>
                        <MagicalDebugButton
                            action={() => {pickCharacterFile(characterDispatch)}}
                            additive={" 4"}
                        />
                    </GridElement>
                    <GridElement id={"MagicalButton5"}>
                        <MagicalDebugButton
                            action={() => {saveCharacterToFile(characterData)}}
                            additive={" 5"}
                        />
                    </GridElement>

                    <MainSection characterData={characterData} characterDispatch={characterDispatch} />
                </div>
            </GridContextReducer.Provider>
        </GridContext.Provider>
        );
}


function pickCharacterFile(characterDispatch) {
    const selectedFile = document.getElementById("file-selector").files[0];
    if (selectedFile === undefined) {
        return;
    }
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            localStorage.setItem("characterData", reader.result);
            characterDispatch({type: "load-from-disk", data: JSON.parse(reader.result)});
        },
        false
    );
    reader.readAsText(selectedFile);
}

function saveCharacterToFile(data) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('download', 'characterData.json');
    a.click()
}