import { useState, createElement, useCallback } from "react";
import { dispatcher } from "../../../Utils";

import MovingController from "./mover";
import ResizingController from "./resizer";
import { GridControllerContext } from "./context";

// the plan is to move grid controlling behaviour here to prevent excessive rerenders of grid elements and their children
// character sheet tracks mouse position, and shares it through mousePosition context
export function GridController({children, gridData}) {
    const [direction, setDirection] = useState("");
    const [activeElementId, setActiveElementId] = useState("");
    const [initialGhostPlacement, setInitialGhostPlacement] = useState({});

    const gridControllerCallback = useCallback(
        ({callerId, direction, initialPlacement}) => {
            setDirection(direction);
            setActiveElementId(callerId);
            setInitialGhostPlacement(initialPlacement);
        },
        []
    );

    const releaseCallback = useCallback(
        (action) => {
            if (activeElementId === "") {
                return;
            }
            const {dx, dy, dh, dw} = action;
            const {x, y, h, w} = gridData[activeElementId];
            const id = activeElementId;
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
            setActiveElementId("");
            setInitialGhostPlacement({});
            dispatcher({type: "grid-merge", id, value: {"x": newX, "y": newY, "h": newH, "w": newW}});
        },
        [gridData, activeElementId]
    )

    if (activeElementId=== "") { // does nothing
        return (
            <GridControllerContext.Provider value={gridControllerCallback}>
                {children}
            </GridControllerContext.Provider>
        )
    }

    const controllerMode = direction === "" ? MovingController : ResizingController;

    const controller = createElement(controllerMode, {id: activeElementId, direction, releaseCallback, initialGhostPlacement});

    return (
        <GridControllerContext.Provider value={gridControllerCallback}>
            {controller}
            {children}
        </GridControllerContext.Provider>
    )
};