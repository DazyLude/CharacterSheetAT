import { useState, useEffect, createElement, useCallback } from "react";

import MovingController from "./mover";
import ResizingController from "./resizer";

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import { GridElementOOC } from "./element";
import { placementStringFromXYWH } from "../../../Utils";

export function GhostController() {
    const [state, setState] = useState({});
    const placement = {x: state.x ?? 1, y: state.y ?? 1, h: state.h ?? 1, w: state.w ?? 1};
    const placementString = placementStringFromXYWH({ ...placement });
    const displayed = state.displayed ?? true;

    const [active, setActive] = useState(false);
    const [direction, setDirection] = useState("");

    const dispatcher = useCallback(
        (placement) => {
            invoke("change_data", {target: "element_ghost", data: {...placement}})
                .catch((e) => console.error(e));
        },
        []
    );

    useEffect( // requests data and subscribes to changes
        () => {
            const onLoad = () => {
                invoke("request_data", { requestedData: "ghost" })
                    .then((e) => setState(e.data))
                    .catch((e) => console.error(e));
            }

            onLoad();

            const unlisten = listen("update_ghost", onLoad);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )

    const releaseCallback = useCallback(
        (action) => {
            if (!active) {
                return;
            }

            const {dx, dy, dh, dw} = action;
            const {x, y, h, w} = placement;
            let newH = h + (dh ?? 0);
            newH = newH < 1 ? 1 : newH;
            let newW = w + (dw ?? 0);
            newW = newW < 1 ? 1 : newW;
            let newX = x + (dx ?? 0);
            if (newX < 1) {
                newX = x;
                newW = w;
            }
            let newY = y + (dy ?? 0);
            if (newY < 1) {
                newY = x;
                newH = w;
            }

            setDirection("");
            setActive(false);

            const newPlacement = {"x": newX, "y": newY, "h": newH, "w": newW};
            dispatcher(newPlacement);
        },
        [active, placement, dispatcher]
    )

    if (!displayed) {
        return (<></>);
    }

    const BackendGhost = createElement(GridElementOOC, {
        move: () => {
            setActive(true);
        },
        resize: (direction) => {
            setActive(true);
            setDirection(direction);
        },
        id: "new element placed here",
        style: {
            opacity: "0.5",
            zIndex: "11",
            position: "relative",
            display: "grid",
        },
    });

    if (!active) { // does nothing
        return (
            <div className="grid-element" style={{gridArea: placementString}}>
                {BackendGhost}
            </div>
        )
    }

    const controllerMode = direction === "" ? MovingController : ResizingController;

    const controller = createElement(controllerMode, {id: "ghost", direction, releaseCallback, initialGhostPlacement: placement});

    return (
        <>
            <div className="grid-element" style={{position: "relative", gridArea: placement}}>
                {BackendGhost}
            </div>
            {controller}
        </>
    )
}