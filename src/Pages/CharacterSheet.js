import { useEffect, useState, useCallback, useMemo, createElement } from "react";
import { funnyConstants, dispatcher } from "./Utils";

import { GridController, GridElementMemo } from "./Components/Systems/grid";
import { GridContext, GridContextReducer } from "./Components/Systems/grid";
import { MousePositionContext } from "./Components/Systems/mouseTracker";
import StatusBar from "./Components/statusBar"

import { getUIElementFromString } from "./Components/UIElements";

import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api";

export default function CharacterSheet() {
    const [mousePosition, setMousePosition] = useState([0, 0]);
    const [characterData, setCharacterData] = useState({globals:{}, grid:{}, elements:{}});
    const characterDispatch = useCallback(
        (args) => {
            dispatcher(args);
        },
        []
    );

    useEffect( // requests data and subscribes to changes
        () => {
            invoke("request_data")
                .then((e) => setCharacterData(e.data))
                .catch((e) => console.error(e));

            const onLoad = (e) => {
                const data = e.payload.data;
                if (data !== undefined) {
                    setCharacterData(data);
                }
            }

            const unlisten = listen("new_character_sheet", onLoad);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )

    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;

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
                const {x, y} = characterData.grid[id];
                let newX = x + (dx ?? 0);
                newX = newX < 0 ? 0 : newX;
                let newY = y + (dy ?? 0);
                newY = newY < 0 ? 0 : newY;
                characterDispatch({type: "grid-merge", id, value: {"x": newX, "y": newY}});
            break;
            case ("resize"): // changes elements size (by id)
                const {dh, dw} = action;
                const {h, w} = characterData.grid[id];
                let newH = h + (dh ?? 0);
                newH = newH < 1 ? 1 : newH;
                let newW = w + (dw ?? 0);
                newW = newW < 1 ? 1 : newW;
                characterDispatch({type: "grid-merge", id, value: {"h": newH, "w": newW}});
            break;
            default:
                console.error("grid reducer called with an unknown operation");
        }
    }, [characterData.grid, characterDispatch]);

    const gridElementsList = useMemo(
        () => {
            return Object.entries(characterData.grid).map(
                ([key, val]) => {
                    const id = key;
                    const typeString = val.type;
                    const position = {x: val.x, y: val.y, h: val.h, w: val.w}

                    return (
                        <GridElementMemo key={id} id={id} position={position}>
                            {createElement(getUIElementFromString(typeString), {characterDispatch, characterData, id})}
                        </GridElementMemo>
                    );
                }
            );
        },
        [characterDispatch, characterData]
    );

    return (
        <GridContext.Provider value={characterData.grid}>
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
                    <div style={{gridColumn: "1 / -1", height: "500px"}}>
                        {/* intentionally empty; this is a blank filler at the bottom */}
                    </div>
                </div>
                </MousePositionContext.Provider>
            </GridContextReducer.Provider>
        </GridContext.Provider>
    );
}