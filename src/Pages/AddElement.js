import { useCallback, useEffect, useState } from "react";
import { UseEffectButton } from "./Components/CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen, emit } from '@tauri-apps/api/event';

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
    const [state, setState] = useState({});
    const placement = state.placement ?? {x: 1, y: 1, w: 1, h: 1};
    const id = state.id ?? "";
    const isActive = state.is_active ?? false;
    const [selection, setSelection] = useState("none");

    useEffect( // requests data and subscribes to changes
        () => {
            invoke("request_data", {requestedData: "add-element"})
                .then((e) => setState(e.data))
                .catch((e) => console.error(e));

            const onLoad = (e) => {
                const data = e.payload;
                console.log(data);
                if (data !== undefined) {
                    setState(data);
                }
            }

            const unlisten = listen("new_data", onLoad);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )

    const createGridElement = useCallback(
        () => {
            const elementInitialData = { ...constructibleElements[selection].data };
            emit("add_new_element", elementInitialData);
        },
        [selection]
    );

    const setId = useCallback(
        (newId) => {
            emit("change_add_element_state", { id: newId });
        }
    )

    const setPlacement = useCallback(
        (newPlacement) => {
            emit("change_add_element_state", { placement: newPlacement });
        }
    )

    const isCreateButtonActive = () => {
        if (!isActive) {
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
                        setPlacement({type: e.target.value, ...constructibleElements[e.target.value].defaultSize})
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
                    onChange={(e) => {setPlacement({x: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-w">new element width (w): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-w"
                    min={-1}
                    max={13 - placement.x}
                    type="number"
                    value={placement.w}
                    onChange={(e) => {setPlacement({w: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-y">new element row (y): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-y"
                    type="number"
                    min={1}
                    value={placement.y}
                    onChange={(e) => {setPlacement({y: parseInt(e.target.value)})}}
                    />
                <label htmlFor="element-h">new element height (h): </label>
                <input
                    style={{textAlign: "left"}}
                    id="element-h"
                    type="number"
                    min={-1}
                    value={placement.h}
                    onChange={(e) => {setPlacement({h: parseInt(e.target.value)})}}
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
                            createGridElement()
                        }
                    }
                />
                }
        </div>
    );
}

