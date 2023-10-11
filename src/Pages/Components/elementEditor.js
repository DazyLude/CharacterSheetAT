import { useContext, useEffect, useState } from "react";
import { GridContext } from "./Grid/gridContext";
import { UseEffectButton } from "./CommonFormElements";

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
        data: {dataSet: {}, count: 0},
        idCode: "inventory",
        defaultSize: {w: 12, h: 10},
    },
    "spellList": {
        data: {dataSet: {}, count: 0, spellCastingAbility: "cha", weaponBonus: 0},
        idCode: "spell list",
        defaultSize: {w: 12, h: 10},
    }
}

export default function ElementEditor({dispatch}) {
    const [selection, setSelection] = useState("none");
    const [id, setId]= useState("");
    const [removerSelection, setRemSelection] = useState("none");
    const [activeWindow, setActiveWindow] = useState(0);

    const gridData = useContext(GridContext);
    const usedKeys = Object.keys(gridData);
    const lowestRow = Object.values(gridData).map(({y, h}) => y + h).reduce((val, sav) => val < sav ? sav : val, 0);
    const [placement, setPlacement] = useState({x: 1, y: lowestRow, w: 1, h: 1});
    useEffect(() => {setPlacement((p) => {return {...p, y: lowestRow}})}, [lowestRow]);

    const isCreateButtonActive = () => {
        if (usedKeys.find((e) => e === id)) {
            return <span className="error">id is already in use</span>;
        }
        if (selection === "none") {
            return <span className="error">select an element to create</span>;
        }
        return null;
    }
    const creatorOptions = Object.entries(constructibleElements).map(([key, val]) => {
        return <option value={key} key={key}>{val.idCode}</option>
    })

    const removerOptions = usedKeys.map((key) => {
        return <option value={key} key={key}>{key}</option>
    })

    const activateWindow = (n) => {if (activeWindow!==n) {setActiveWindow(n)} else {setActiveWindow(0)}}

    return (
        <>
            <div style={{
                position: "absolute",
                display: "grid",
                zIndex: "10"
            }}>
                <UseEffectButton title="create an element" action={() => {activateWindow(1)}} />
                <UseEffectButton title="remove an element" action={() => {activateWindow(2)}} />
            </div>

            <div style={{
                display: activeWindow === 1 ? "block" : "none",
                position: "absolute",
                zIndex: "10",
                top: "150px",
                background: "#eeeeee",
                border: "solid 1px #d0d0d0",
                padding: "10px",
                width: "500px",
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
                            setPlacement({...placement, ...constructibleElements[e.target.value].defaultSize})
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
                        onChange={(e) => {setPlacement({...placement, x: parseInt(e.target.value)})}}
                        />
                    <label htmlFor="element-w">new element width (w): </label>
                    <input
                        style={{textAlign: "left"}}
                        id="element-w"
                        min={-1}
                        max={13 - placement.x}
                        type="number"
                        value={placement.w}
                        onChange={(e) => {setPlacement({...placement, w: parseInt(e.target.value)})}}
                        />
                    <label htmlFor="element-y">new element row (y): </label>
                    <input
                        style={{textAlign: "left"}}
                        id="element-y"
                        type="number"
                        min={1}
                        value={placement.y}
                        onChange={(e) => {setPlacement({...placement, y: parseInt(e.target.value)})}}
                        />
                    <label htmlFor="element-h">new element height (h): </label>
                    <input
                        style={{textAlign: "left"}}
                        id="element-h"
                        type="number"
                        min={-1}
                        value={placement.h}
                        onChange={(e) => {setPlacement({...placement, h: parseInt(e.target.value)})}}
                        />
                </div>
                    {isCreateButtonActive() ??
                    <UseEffectButton
                        title="add new element to the grid"
                        action={() => {
                            dispatch({
                                type: "add-grid-element",
                                elementId: id,
                                elementData: {type: selection, ...constructibleElements[selection].data},
                                elementPlacement: placement,
                            })
                        }}
                    />
                    }
            </div>
            <div style={{
                display: activeWindow === 2 ? "block" : "none",
                position: "absolute",
                zIndex: "10",
                top: "150px",
                background: "#eeeeee",
                border: "solid 1px #d0d0d0",
                padding: "10px",
                }}
            >
                <select
                    id="element-type"
                    value={removerSelection}
                    onChange={(e) => {
                        setRemSelection(e.target.value);
                    }}
                >
                    <option value={"none"}>select</option>
                    {removerOptions}
                </select>
                <UseEffectButton
                    title="remove an element from the grid"
                    action={() => {
                        dispatch({
                            type: "remove-grid-element",
                            elementId: removerSelection,
                        })
                    }}
                />
            </div>
        </>
    );
}

