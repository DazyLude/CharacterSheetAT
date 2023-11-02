import { useCallback, useEffect, useState } from "react";
import { UseEffectButton } from "./Components/CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';

import { dispatcher, placementStringFromXYWH } from "./Utils";

const constructibleElements = {
    "none": { // an example element
        data: {}, // default data values
        idCode: "", // default id value
        defaultSize: {w: 1, h: 1} // default size values
    },
    "customTextField": {
        data: {titleText: "", bodyText: ""},
        idCode: "custom text field",
        defaultSize: {w: 2, h: 3}
    },
    "generalInfo": {
        data: {},
        idCode: "general info",
        defaultSize: {w: 12, h: 3}
    },
    "primarySkills": {
        data: {},
        idCode: "primary skills",
        defaultSize: {w: 2, h: 18}
    },
    "secondarySkills": {
        data: {},
        idCode: "secondary skills",
        defaultSize: {w: 3, h: 18}
    },
    "battleStats": {
        data: {},
        idCode: "battle stats",
        defaultSize: {w: 3, h: 3}
    },
    "healthStats": {
        data: {},
        idCode: "health stats",
        defaultSize: {w: 4, h: 4}
    },
    "deathSavesTracker": {
        data: {},
        idCode: "death saves tracker",
        defaultSize: {w: 3, h: 3}
    },
    "hitdiceTracker": {
        data: {},
        idCode: "hitdice tracker",
        defaultSize: {w: 2, h: 3}
    },
    "exhaustionTracker": {
        data: {},
        idCode: "exhaustion tracker",
        defaultSize: {w: 2, h: 3}
    },
    "savingThrowsStats": {
        data: {},
        idCode: "saving throws",
        defaultSize: {w: 5, h: 6}
    },
    "proficiencyModifierTracker": {
        data: {},
        idCode: "proficiency modifier",
        defaultSize: {w: 2, h: 3}
    },
    "abilitySaveDC": {
        data: {stat: "str"},
        idCode: "ability save",
        defaultSize: {w: 2, h: 3}
    },
    "sensesStats": {
        data: {},
        idCode: "passive senses",
        defaultSize: {w: 5, h: 5},
    },
    "inventory": {
        data: {data: {}, count: 0},
        idCode: "inventory",
        defaultSize: {w: 12, h: 10},
    },
    "spellList": {
        data: {data: {}, count: 0, spellCastingAbility: "cha", weaponBonus: 0},
        idCode: "spell list",
        defaultSize: {w: 12, h: 10},
    },
    "imageDisplay": {
        data: {path: "", text: ""},
        idCode: "image",
        defaultSize: {w: 5, h: 5}
    }
}

export default function ElementEditor() {
    const [selection, setSelection] = useState("none");
    const [id, setId]= useState("");
    const [placement, setPlacement] = useState({x: 1, y: 1, w: 1, h: 1});

    const [gridData, setGridData] = useState({});

    useEffect( // requests data and subscribes to changes
    () => {
        invoke("request_data")
        .then((e) => setGridData(e.data.grid))
        .catch((e) => console.error(e));

        const onLoad = (e) => {
            const data = e.payload.data.grid;
            if (data !== undefined) {
                setGridData(data);
            }
        }

        const unlisten = listen("new_character_sheet", onLoad);
        return () => {
            unlisten.then(f => f());
        };
    },
    []
    )

    const mergePlacement = useCallback(
        (placementMerge) => {
            const new_placement = {...placement, ...placementMerge};
            setPlacement({...new_placement});
            drawGhost(new_placement)
        },
        [placement]
    )

    const drawGhost = useCallback(
        (new_placement) => {
            invoke("request_ghost_drawn", {
                ghostStyle: {
                    "background": "green",
                    "gridArea": placementStringFromXYWH(new_placement)
                }})
                .catch((e) => console.error(e));
        },
        []
    );

    useEffect(
        () => {
            const onRequest = () => {drawGhost(placement);};
            const unlisten = listen("add_ghost_request", onRequest);
            return () => {
                unlisten.then(f => f());
            };
        },
        [drawGhost, placement]
    )

    const createGridElement = useCallback(
        ({ elementType, elementId, elementPlacement }) => {
            const elementInitialData = { ...constructibleElements[selection].data };
            dispatcher({type: "grid-merge", id: elementId, value: {type: elementType, ...elementPlacement}});
            if (Object.keys(elementInitialData).length !== 0) {
                dispatcher({type: "element-merge", id: elementId, value: elementInitialData});
            }
        },
        [selection]
    );

    const usedKeys = Object.keys(gridData);
    const lowestRow = Object.values(gridData).map(({y, h}) => y + h).reduce((val, sav) => val < sav ? sav : val, 1);

    useEffect(
        () => {
            mergePlacement({y: lowestRow})
        },
        [lowestRow]
    );

    const isCreateButtonActive = () => {
        if (usedKeys.find((e) => e === id)) {
            return <div className="error">id is already in use</div>;
        }
        if (selection === "none") {
            return <div className="error">select an element to create</div>;
        }
        return false;
    }
    const creatorOptions = Object.entries(constructibleElements).map(([key, val]) => {
        return <option value={key} key={key}>{val.idCode}</option>
    })


    return (
        <div style={{
            display:  "block",
            background: "#eeeeee",
            border: "solid 1px #d0d0d0",
            padding: "10px",
            width: "500px",
            height: "231px",
        }}
            className="sheet-subscript"
        >
            <div style={{marginBottom: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "20px", textAlign: "right", rowGap: "10px"}}>
                <label htmlFor="element-type">new element type: </label>
                <select
                    id="element-type"
                    value={selection}
                    onChange={(e) => {
                        setId(constructibleElements[e.target.value].idCode);
                        mergePlacement({...constructibleElements[e.target.value].defaultSize})
                        setSelection(e.target.value);
                    }}
                    >
                    <option value={"none"}>select</option>
                    {creatorOptions}
                </select>
                <label htmlFor="element-id">new element id: </label>
                <input style={{textAlign: "left"}} id="element-id" type="text" value={id} onChange={(e) => {setId(e.target.value)}}/>
                <label htmlFor="element-x">new element column (x): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-x"
                    type="number"
                    min={1}
                    max={12}
                    value={placement.x}
                    onChange={(e) => {mergePlacement({x: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-w">new element width (w): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-w"
                    min={-1}
                    max={13 - placement.x}
                    type="number"
                    value={placement.w}
                    onChange={(e) => {mergePlacement({w: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-y">new element row (y): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-y"
                    type="number"
                    min={1}
                    value={placement.y}
                    onChange={(e) => {mergePlacement({y: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-h">new element height (h): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-h"
                    type="number"
                    min={-1}
                    value={placement.h}
                    onChange={(e) => {mergePlacement({h: parseInt(e.target.value)})}}
                    />
            </div>
            {
                isCreateButtonActive() ?
                <>{isCreateButtonActive()}</>
                :
                <UseEffectButton
                    title="add new element to the grid"
                    action={
                        () => {
                            createGridElement({
                                elementId: id,
                                elementType: selection,
                                elementPlacement: placement,
                            })
                        }
                    }
                />
                }
        </div>
    );
}

