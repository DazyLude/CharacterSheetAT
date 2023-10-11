import { useReducer, useEffect, useState, useCallback, useMemo, createElement } from "react";
import { characterReducer, characterDataValidation, funnyConstants } from "./Utils";

import { GridController, GridElementMemo } from "./Components/Systems/grid";
import { GridContext, GridContextReducer } from "./Components/Systems/grid";
import { MousePositionContext } from "./Components/Systems/mouseTracker";

import { getUIElementFromString } from "./Components/UIElements";
import StatusBar from "./Components/statusBar";



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
                setMousePosition([e.pageX, e.pageY]);
            }
            const root = document.getElementById("root");
            root.addEventListener('mousemove', update);
            root.addEventListener('touchmove', update);

            return () => {
                root.removeEventListener('mousemove', update);
                root.removeEventListener('touchmove', update);
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

    const gridElementsList = useMemo(
        () => {
            return Object.entries(characterData.gridElements).map(
                ([key, val]) => {
                    const id = key;
                    const typeString = val.type;

                    return (
                        <GridElementMemo key={id} id={id} position={characterData.gridData[id]}>
                            {createElement(getUIElementFromString(typeString), {characterDispatch, characterData, id})}
                        </GridElementMemo>
                    );
                }
            );
        },
        [characterDispatch, characterData]
    );



    return (
        <GridContext.Provider value={characterData.gridData}>
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
                            <GridController>
                                {gridElementsList}
                            </GridController>
                    </div>
                </div>
                </MousePositionContext.Provider>
            </GridContextReducer.Provider>
        </GridContext.Provider>
    );
}