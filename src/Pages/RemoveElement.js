import { useCallback, useEffect, useState } from "react";
import { UseEffectButton } from "./Components/CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';

import { dispatcher, placementStringFromXYWH } from "./Utils";

export default function RemoveElement() {
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

    const drawGhost = useCallback(
        (id) => {
            if (gridData[id] === undefined) {
                invoke("request_ghost_drawn", {
                    ghostStyle: {
                        "display": "none"
                    }})
                    .catch((e) => console.error(e));
                return;
            }
            invoke("request_ghost_drawn", {
                ghostStyle: {
                    "background": "red",
                    "gridArea": placementStringFromXYWH(gridData[id])
                }})
                .catch((e) => console.error(e));
        },
        [gridData]
    )

    useEffect(
        () => {
            const onRequest = () => {drawGhost(selection);};
            const unlisten = listen("remove_ghost_request", onRequest);
            return () => {
                unlisten.then(f => f());
            };
        },
        [drawGhost, selection]
    )

    const dispatch = useCallback(
        (id) => {
            dispatcher({type: "remove", id});
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
                    drawGhost(e.target.value)
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

