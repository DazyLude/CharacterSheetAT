import { useContext, useState, useEffect, memo, createElement, createContext, useCallback } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDown, faUpRightAndDownLeftFromCenter, faUpDownLeftRight } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../appContext";
import { GridContext, GridContextReducer, MousePositionContext } from "./gridContext";
import { funnyConstants } from "../../Utils";

const GridControllerContext = createContext(() => {});

export function GridElement({id, children}) {
    const gridControllerCallback = useContext(GridControllerContext);
    const { isLayoutLocked } = useContext(AppContext);
    const { x, y, h, w } = useContext(GridContext)[id] ?? { x: 1, y: 1, w: 1, h: 1 };

    const move = useCallback(
        () => {
            gridControllerCallback({callerId: id, direction: ""});
        },
        [gridControllerCallback, id]
    )

    const resize = useCallback(
        (direction) => {
            gridControllerCallback({callerId: id, direction});
        },
        [gridControllerCallback, id]
    )

    const placement = `${y} / ${x} / ${h === -1 ? -1 : y + h} / ${w === -1 ? -1 : x + w}`

    return (
        <div className="grid-element" style={{position: "relative", gridArea: placement}}>
            {isLayoutLocked ? null :
                <>
                    <div style={{
                        zIndex: "3",
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        opacity: "0.95",
                        alignItems: "center",
                        display: "grid",
                        gridTemplateColumns: "1fr 4fr 1fr",
                        gridTemplateRows: "1fr 4fr 1fr",
                        textAlign: "center",
                        }}
                        className="form-subscript"
                        title={id}
                    >
                        {/* top left */}
                        <div
                            onMouseDown={() => {resize('ul')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "nw-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} rotation={90}/>
                        </div>
                        {/* neutral good */}
                        <div
                            onMouseDown={() => {resize('u')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "dimgrey", width: "100%", height: "100%", cursor: "n-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpDown} />
                        </div>
                        {/* top right */}
                        <div
                            onMouseDown={() => {resize('ur')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "ne-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/>
                        </div>
                        {/* lawful neutral */}
                        <div
                            onMouseDown={() => {resize('l')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "dimgrey", width: "100%", height: "100%", cursor: "w-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpDown} rotation={90}/>
                        </div>
                        {/* center */}
                        <div
                            onMouseDown={() => {move()}}
                            style={{display: "flex", flexDirection: "column", justifyContent: "space-around", background: "gray", width: "100%", height: "100%", cursor: "move"}}
                        >
                            <div style={{height: "40px", textOverflow:"ellipsis", overflow: "hidden"}}>id: {id}</div>
                            <FontAwesomeIcon icon={faUpDownLeftRight} />
                        </div>
                        {/* chaotic neutral */}
                        <div
                            onMouseDown={() => {resize('r')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "dimgrey", width: "100%", height: "100%", cursor: "e-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpDown} rotation={90}/>
                        </div>
                        {/* bottom left */}
                        <div
                            onMouseDown={() => {resize('ld')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "sw-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/>
                        </div>
                        {/* neutral evil */}
                        <div
                            onMouseDown={() => {resize('d')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "dimgrey", width: "100%", height: "100%", cursor: "s-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpDown} />
                        </div>
                        {/* bottom right */}
                        <div
                            onMouseDown={() => {resize('rd')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "se-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} rotation={90}/>
                        </div>
                    </div>
                </>
            }
            {children}
        </div>
    );
};

// the plan is to move grid controlling behaviour here to prevent excessive rerenders of grid elements and their children
// character sheet tracks mouse position, and shares it through mousePosition context
export function GridController({children}) {
    const [direction, setDirection] = useState("");
    const [activeElementId, setActiveElementId] = useState("");

    const gridControllerCallback = useCallback(
        ({callerId, direction}) => {
            setDirection(direction);
            setActiveElementId(callerId)
        },
        []
    )

    const releaseCallback = useCallback(
        () => {
            setDirection("");
            setActiveElementId("");
        },
        []
    )

    if (activeElementId=== "") { // does nothing
        return (
            <GridControllerContext.Provider value={gridControllerCallback}>
                {children}
            </GridControllerContext.Provider>
        )
    }

    const controllerMode = direction === "" ? MovingController : ResizingController;


    const controller = createElement(controllerMode, {id: activeElementId, direction, releaseCallback});

    return (
        <GridControllerContext.Provider value={gridControllerCallback}>
            {controller}
            {children}
        </GridControllerContext.Provider>
    )
};

function MovingController({id, releaseCallback}) {
    const gridReducer = useContext(GridContextReducer);
    const mousePosition = useContext(MousePositionContext);
    const [savedMousePosition, setSavedMousePosition] = useState(mousePosition);
    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;

    if (ArrEq(mousePosition, [0, 0])) {
        setSavedMousePosition(mousePosition);
    }
    const dx = Math.trunc((mousePosition[0] - savedMousePosition[0]) / (columnGap + columnWidth));
    const dy = Math.trunc((mousePosition[1] - savedMousePosition[1]) / (rowGap + rowHeight));

    useEffect(
        () => {
            const release = () => {
                releaseCallback();
                setSavedMousePosition([0, 0]);
            }
            window.addEventListener("mouseup", release, {once: true});
            window.addEventListener("touchend", release, {once: true});
        },
        [setSavedMousePosition, releaseCallback]
    );

    useEffect(
        () => {
            if (dx !== 0) {
                gridReducer("move", {id, dx});
                setSavedMousePosition([mousePosition[0], savedMousePosition[1]]);
            }
            if (dy !== 0) {
                gridReducer("move", {id, dy});
                setSavedMousePosition([savedMousePosition[0], mousePosition[1]]);
            }
        },
        [dx, dy, id, mousePosition, savedMousePosition, gridReducer]
    );

    return <></>;
}

function ResizingController({id, direction, releaseCallback}) {
    const gridReducer = useContext(GridContextReducer);
    const mousePosition = useContext(MousePositionContext);
    const [savedMousePosition, setSavedMousePosition] = useState(mousePosition);
    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;

    if (ArrEq(mousePosition, [0, 0])) {
        setSavedMousePosition(mousePosition);
    }

    const release = useCallback(
        () => {
            releaseCallback();
            setSavedMousePosition([0, 0]);
        },
        [setSavedMousePosition, releaseCallback]
    )

    useEffect(
        () => {
            window.addEventListener("mouseup", release, {once: true});
            window.addEventListener("touchend", release, {once: true});
        },
        [release]
    );

    const dx = Math.trunc((mousePosition[0] - savedMousePosition[0]) / (columnGap + columnWidth));
    const dy = Math.trunc((mousePosition[1] - savedMousePosition[1]) / (rowGap + rowHeight));

    useEffect(
        () => {
            if (dy !== 0) {
                if (direction.includes('u')) {
                    gridReducer("move", {id, dy});
                    gridReducer("resize", {id, dh: -dy});
                }
                else if (direction.includes('d')) {
                    gridReducer("resize", {id, dh: dy});
                }
                setSavedMousePosition([savedMousePosition[0], mousePosition[1]]);
            }
            if (dx !== 0) {
                if (direction.includes('l')) {
                    gridReducer("move", {id, dx});
                    gridReducer("resize", {id, dw: -dx});
                }
                else if (direction.includes('r')) {
                    gridReducer("resize", {id, dw: dx});
                }
                setSavedMousePosition([mousePosition[0], savedMousePosition[1]]);
            }
        },
        [id, dx, dy, savedMousePosition, mousePosition, gridReducer, direction]
    );

    return <></>;
}

// memoized version of gridElement
// prevents rerenders when parents are updated
export const GridElementMemo = memo(GridElement);

function ArrEq(array1, array2) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return false;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    for (let index = 0; index < array1.length; index++) {
        if (array1[index] !== array2[index]) {
            return false;
        }
    }
    return true;
}