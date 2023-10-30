import { useCallback, useEffect, useState } from "react";
import { UseEffectButton } from "./Components/CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';

import { dispatcher } from "./Utils";

export default function ElementEditor() {
    const [selection, setSelection] = useState("none");
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

    const dispatch = useCallback(
        (args) => {
            dispatcher(args);
        },
        []
    );

    const usedKeys = Object.keys(gridData);
    const removerOptions = usedKeys.map((key) => {
        return <option value={key} key={key}>{key}</option>
    })

    return (
        <div style={{
            display: "block",
            background: "#eeeeee",
            border: "solid 1px #d0d0d0",
            padding: "10px",
            }}
        >
            <select
                id="element-type"
                value={selection}
                onChange={(e) => {
                    setSelection(e.target.value);
                }}
            >
                <option value={"none"}>select</option>
                {removerOptions}
            </select>
            <UseEffectButton
                title="remove an element from the grid"
                action={() => {
                    dispatch({
                        type: "remove",
                        id: selection,
                    })
                }}
            />
        </div>
    );
}

