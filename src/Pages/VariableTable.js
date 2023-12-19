import { useState, useEffect, useCallback } from "react";
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
                invoke("request_data", { requestedData: "editor" })
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
            invoke("request_data", { requestedData: "variables" })
                .then((e) => {
                    setProcessedVariables(e.data)
                })
                .catch((e) => console.error(e));
        },
        [data]
    )

    const addNewVariable = useCallback(
        (newName) => {
            changeData({ value_type: "any-set", merge_object: { path: ['variables', newName], new_value: "value goes here" } }, "character_data");
        },
        []
    );

    const changeVariable = useCallback(
        (name, newValue) => {
            changeData({ value_type: "any-set", merge_object: { path: ['variables', name], new_value: newValue } }, "character_data");
        },
        []
    );

    const table_rows = [];
    for (const v_name in data) {
        const row = (<tr key={v_name}>
            <td>{v_name}</td>
            <td>
                <TextInputNoContext style={{ width: "100%" }} value={data[v_name]} onChange={(c) => { changeVariable(v_name, c) }} />
            </td>
            <td>{processedVariables[v_name] ?? ""}</td>
        </tr>);
        table_rows.push(row);
    }

    return (
        <div className={"sheet-subscript"}>
            Name: <TextInputNoContext value={newVarName} onChange={setNewVarName} />
            <UseEffectButton action={() => { addNewVariable(newVarName); setNewVarName(""); }} title={"add"} />
            <table>
                <tr>
                    <th>Name</th>
                    <th style={{ width: "400px" }}>Value</th>
                    <th>Proccessed Value</th>
                </tr>
                {table_rows}
            </table>
        </div>
    );
}
