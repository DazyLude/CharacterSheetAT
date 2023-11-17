import { useCallback, useEffect, useState } from "react";
import { UseEffectButton } from "./Components/CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';

import { dispatcher, placementStringFromXYWH } from "./Utils";

export default function RemoveElement() {
    const [state, setState] = useState({"a": {}, "b": {}});
    const [selection, setSelection] = useState("none");

    useEffect( // requests data and subscribes to changes
        () => {
            const onLoad = () => {
                invoke("request_data", { requestedData: "remove-element" })
                    .then((e) => setState(e.data.grid))
                    .catch((e) => console.error(e));
            }

            onLoad();

            const unlisten = listen("new_character_sheet", onLoad);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )

    const dispatch = useCallback(
        (id) => {
            dispatcher({type: "remove", id});
        },
        []
    );

    const usedKeys = Object.keys(state);
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
                    dispatch(selection)
                }}
            />
        </div>
    );
}

