import { useState, useEffect, useCallback, createElement, Fragment } from "react";
import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';
import { changeData } from "./Utils";
import { UseEffectButton } from "./Components/CommonFormElements";
import { TextInputNoContext } from "./Components/CommonFormElements";


export default function VariableTable() {
    const [data, setData] = useState({});
    const [newVarName, setNewVarName] = useState("");
    const [processedVariables, setProcessedVariables] = useState({});
    useEffect( // requests data and subscribes to changes
        () => {
            const onLoad = () => {
                invoke("request_data", {requestedData: "editor"})
                    .then((e) => setData(e.data?.variables))
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
    useEffect(
        () => {
            invoke("request_data", {requestedData: "variables"})
                .then((e) => {
                    setProcessedVariables(e.data)
                })
                .catch((e) => console.error(e));
        },
        [data]
    )

    const addNewVariable = useCallback(
        (newName) => {
            changeData({value_type: "any-set", merge_object: {path: ['variables', newName], new_value: "value goes here"}}, "character_data");
        },
        []
    );

    const changeVariable = useCallback(
        (name, newValue) => {
            changeData({value_type: "any-set", merge_object: {path: ['variables', name], new_value: newValue}}, "character_data");
        },
        []
    );

    const table_rows = [];
    for (const v_name in data) {
        const row = (<div key={v_name}>
                        |<span>{v_name}</span>
                        |<TextInputNoContext style={{width: "40%"}} value={data[v_name]} onChange={(c) => {changeVariable(v_name, c)}} />
                        |<span>{processedVariables[v_name]??""}</span>|
                    </div>);
        table_rows.push(row);
    }

    console.log(processedVariables);

    let currentProcessedValue = "";
    invoke("request_data", {requestedData: "variable", requestedDataArgument: ""})
        .then((e) => {currentProcessedValue = e.data})
        .catch((e) => {console.error(e);});

    return (
        <div>
            Name: <TextInputNoContext value={newVarName} onChange={setNewVarName}/>
            <UseEffectButton action={() => {addNewVariable(newVarName); setNewVarName("");}} title={"add"}/>
            {table_rows}
        </div>
    );
}
