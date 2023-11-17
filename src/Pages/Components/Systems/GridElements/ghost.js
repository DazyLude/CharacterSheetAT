import { useState, useEffect, createElement, useCallback } from "react";

import MovingController from "./mover";
import ResizingController from "./resizer";

import { emit, listen } from "@tauri-apps/api/event";
import { GridElementOOC } from "./element";

export function GhostController() {
    const [displayed, setDisplayed] = useState(false);
    const [style, setStyle] = useState({});

    const [active, setActive] = useState(false);
    const [placement, setPlacement] = useState({});
    const [direction, setDirection] = useState("");

    const dispatcher = useCallback(
        (placement) => {
            emit("ghost_moved", placement)
        },
        []
    );

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
            setPlacement(newPlacement);
            dispatcher(newPlacement);
        },
        [active, placement, dispatcher]
    )

    const BackendGhost = createElement(GridElementOOC, {
        move: () => {
            setActive(true);
        },
        resize: (direction) => {
            setActive(true);
            setDirection(direction);
        },
        id: "",
        style: {
            opacity: "0.5",
            zIndex: "11",
            position: "relative",
            display: displayed ? "block" : "none",
            ...style
        },
    });

    if (!active) { // does nothing
        return (
            <div className="grid-element" style={{position: "relative", gridArea: placement}}>
                {BackendGhost}
            </div>
        )
    }

    const controllerMode = direction === "" ? MovingController : ResizingController;

    const controller = createElement(controllerMode, {id: "ghost", direction, releaseCallback, placement});

    return (
        <>
            <div className="grid-element" style={{position: "relative", gridArea: placement}}>
                {BackendGhost}
            </div>
            {controller}
        </>
    )
}