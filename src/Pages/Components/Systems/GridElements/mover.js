import { useContext, useState, useEffect, createElement, useRef } from "react";

import { MousePositionContext } from "../mouseTracker";
import { funnyConstants, placementStringFromXYWH } from "../../../Utils";

export default function MovingController({releaseCallback, initialGhostPlacement}) {
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
                const dx = Math.round((e.pageX - savedMousePosition[0]) / (columnGap + columnWidth));
                const dy = Math.round((e.pageY - savedMousePosition[1]) / (rowGap + rowHeight));
                releaseCallback({dx, dy});
            }
            window.addEventListener("mouseup", release, {once: true});
            window.addEventListener("touchend", release, {once: true});
            return () => {
                window.removeEventListener("mouseup", release);
                window.removeEventListener("touchend", release);
            }
        },
        [releaseCallback, savedMousePosition, columnGap, columnWidth, rowGap, rowHeight]
    );

    const leftOffset = mousePosition[0] - savedMousePosition[0];
    const dx = Math.round(leftOffset / (columnGap + columnWidth));
    const topOffset = mousePosition[1] - savedMousePosition[1];
    const dy = Math.round(topOffset / (rowGap + rowHeight));
    const snappedPlacement = placementStringFromXYWH({x: x + dx, y: y + dy, w, h});

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