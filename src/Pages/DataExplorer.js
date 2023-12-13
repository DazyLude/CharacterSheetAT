import { createElement, useEffect, useState } from "react";
import { TextInputNoContext } from "./Components/CommonFormElements"

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';
import { changeData } from "./Utils";

export default function DataExplorer() {
    const [data, setData] = useState({});
    const [dataPathArr, setPath] = useState(["variables"]);
    const [newValue, setNewValue] = useState("");
    useEffect( // requests data and subscribes to changes
        () => {
            const onLoad = () => {
                invoke("request_data", {requestedData: "editor"})
                    .then((e) => setData(e.data))
                    .catch((e) => console.error(e));
            }

            onLoad()

            const unlisten = listen("new_data", onLoad);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )
    let dataPath = "";
    if (dataPathArr.length !== 0) {
        dataPath = dataPathArr.reduce((acc, e) => {return acc + "/" + e}, dataPath);
    }
    let currentValue = data;
    dataPathArr.forEach((p) => {
        if (currentValue.hasOwnProperty(p)) {
            currentValue = currentValue[p]
        }
        else {
            return;
        }
    });

    let possiblePaths = [];
    if (dataPathArr.length !== 0) {
        possiblePaths.push("..");
    }
    const valueIsAnObject = typeof(currentValue) === "object" && !Array.isArray(currentValue) && currentValue != null;
    if (valueIsAnObject) {
        dataPath += "/";
        possiblePaths = possiblePaths.concat(Object.keys(currentValue));
    }

    possiblePaths = possiblePaths.map(
        (p) => {
            if (p === "..") {
                return (createElement("div", {children: p, key: p, onClick: () => {setPath(dataPathArr.slice(0, -1))}}))
            }
            return (createElement("div", {children: p, key: p, onClick: () => {setPath(dataPathArr.concat([p]))}}))
        }
    );

    let setValue = () => {
        changeData({value_type: "any-set", merge_object: {path: dataPathArr, new_value: newValue}}, "character_data");
    }

    return(
        <>
            {dataPath}
            <div>paths: {possiblePaths}</div>
            <div>______</div>
            raw:
            <VariableDisplay variable={currentValue}/>
            <div>______</div>
            set variable value to:
            <TextInputNoContext value={newValue} onChange={setNewValue} />

            <div onClick={setValue}> "click to set" </div>
            <div onClick={() => {setNewValue(parseFloat(newValue))}}> "click to convert to a number" </div>
        </>
    );
}

function VariableDisplay({variable}) {
    return (
        <>
            <div>value: {variable.toString()}</div>
            <div>type: {typeof(variable)}</div>
        </>
    );
}

