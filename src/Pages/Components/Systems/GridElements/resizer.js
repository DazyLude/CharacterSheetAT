import { useContext, useState, useEffect, createElement, useRef } from "react";

import { MousePositionContext } from "../mouseTracker";
import { funnyConstants, placementStringFromXYWH } from "../../../Utils";

export default function ResizingController({direction, releaseCallback, initialGhostPlacement}) {
    const mousePosition = useContext(MousePositionContext);
    const [savedMousePosition, setSavedMousePosition] = useState(mousePosition);
    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;
    const isMounted = useRef(false);
    const {x, y, w, h} = initialGhostPlacement;

    useEffect (
        () => {
            if (!isMounted.current) {
                setSavedMousePosition(mousePosition);
                isMounted.current = true;
            }
        },
        [setSavedMousePosition, isMounted, mousePosition]
    )

    useEffect(
        () => {
            const release = (e) => {
                const mouse_dx = Math.round((e.pageX - savedMousePosition[0]) / (columnGap + columnWidth));
                const mouse_dy = Math.round((e.pageY - savedMousePosition[1]) / (rowGap + rowHeight));
                const diff = {dx: 0, dy: 0, dh: 0, dw: 0};
                if (direction.includes('u')) {
                    diff.dy = mouse_dy;
                    diff.dh = -mouse_dy;
                }
                else if (direction.includes('d')) {
                    diff.dh = mouse_dy;
                }
                if (direction.includes('l')) {
                    diff.dx = mouse_dx;
                    diff.dw = -mouse_dx;
                }
                else if (direction.includes('r')) {
                    diff.dw = mouse_dx;
                }
                releaseCallback({...diff});
            };
            window.addEventListener("mouseup", release, {once: true});
            window.addEventListener("touchend", release, {once: true});
            return () => {
                window.removeEventListener("mouseup", release);
                window.removeEventListener("touchend", release);
            }
        },
        [releaseCallback, direction, savedMousePosition, columnGap, columnWidth, rowGap, rowHeight]
    );

    const leftOffset = mousePosition[0] - savedMousePosition[0];
    const topOffset = mousePosition[1] - savedMousePosition[1];
    const dx = Math.round(leftOffset / (columnGap + columnWidth));
    const dy = Math.round(topOffset / (rowGap + rowHeight));
    const snappedPlacementObject = {x, y, w, h};

    if (direction.includes('u')) {
        snappedPlacementObject.y += dy;
        snappedPlacementObject.h -= dy;
    }
    else if (direction.includes('d')) {
        snappedPlacementObject.h += dy;
    }
    if (direction.includes('l')) {
        snappedPlacementObject.x += dx;
        snappedPlacementObject.w -= dx;
    }
    else if (direction.includes('r')) {
        snappedPlacementObject.w += dx;
    }
    if (snappedPlacementObject.x < 1) {
        snappedPlacementObject.x = x;
        snappedPlacementObject.w = w;
    }
    if (snappedPlacementObject.y < 1) {
        snappedPlacementObject.y = y;
        snappedPlacementObject.h = h;
    }
    const snappedPlacement = placementStringFromXYWH(snappedPlacementObject);

    const snappedGhost = createElement("div", {
        style: {
            background: "green",
            opacity: "0.5",
            zIndex: "11",
            position: "relative",
            gridArea: snappedPlacement,
        }
    });

    return <>{snappedGhost}</>;
}