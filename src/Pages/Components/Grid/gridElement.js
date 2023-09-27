import { useContext, useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDown, faUpRightAndDownLeftFromCenter, faUpDownLeftRight } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../appContext";
import { GridContext, GridContextReducer, MousePositionContext } from "./gridContext";
import { funnyConstants } from "../../Utils";

export default function GridElement({id, children}) {
    const { isLayoutLocked } = useContext(AppContext);
    const { x, y, h, w } = useContext(GridContext)[id] ?? { x: 1, y: 1, w: 1, h: 1 };
    const gridReducer = useContext(GridContextReducer);
    const mousePosition = useContext(MousePositionContext);

    const {columnGap, columnWidth, rowGap, rowHeight} = funnyConstants;

    const [savedMousePosition, setSavedMousePosition] = useState([0, 0]);
    const [direction, setDirection] = useState("");
    const [isMoving, setIsMoving] = useState(false);

    useEffect( // moves the clicked-on element
        () => {
            if (isMoving) {
                const dx = Math.trunc((mousePosition[0] - savedMousePosition[0]) / (columnGap + columnWidth));
                const dy = Math.trunc((mousePosition[1] - savedMousePosition[1]) / (rowGap + rowHeight));
                if (dx !== 0) {
                    gridReducer("move", {id, dx});
                    setSavedMousePosition([mousePosition[0], savedMousePosition[1]]);
                }
                if (dy !== 0) {
                    gridReducer("move", {id, dy});
                    setSavedMousePosition([savedMousePosition[0], mousePosition[1]]);
                }
            }
        },
        [savedMousePosition, setSavedMousePosition, mousePosition, gridReducer, isMoving, columnGap, columnWidth, rowGap, rowHeight, id]
    );

    useEffect( // resizes provided (by id) grid element by delta in a provided direction (l(eft)/r(ight)/u(p)/d(down))
        () => {
            if (direction !== "") {
                const dx = Math.trunc((mousePosition[0] - savedMousePosition[0]) / (columnGap + columnWidth));
                const dy = Math.trunc((mousePosition[1] - savedMousePosition[1]) / (rowGap + rowHeight));
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
            }
        },
        [savedMousePosition, setSavedMousePosition, mousePosition, gridReducer, direction, columnGap, columnWidth, rowGap, rowHeight, id]
    )

    const resize = (direction) => {
        setSavedMousePosition(mousePosition);
        setDirection(direction);

        const release = () => {
            setSavedMousePosition([0, 0]);
            setDirection("");
        }
        window.addEventListener("mouseup", release, {once: true});
        window.addEventListener("touchend", release, {once: true});
    };

    const move = () => {
        setSavedMousePosition(mousePosition);
        setIsMoving(true)

        const release = () => {
            setSavedMousePosition([0, 0]);
            setIsMoving(false)
        }
        window.addEventListener("mouseup", release, {once: true});
        window.addEventListener("touchend", release, {once: true});
    };

    const placement = `${y} / ${x} / ${h === -1 ? -1 : y + h} / ${w === -1 ? -1 : x + w}`

    return (
        <div className="grid-element" style={{position: "relative", gridArea: placement}}>
            {isLayoutLocked ? null :
                <>
                    <div style={{
                        zIndex: "2",
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
                    >
                        {/* top left */}
                        <div
                            onMouseDown={() => {resize('ul')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "nw-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} rotation={"90"}/>
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
                            <FontAwesomeIcon icon={faUpDown} rotation={"90"}/>
                        </div>
                        {/* center */}
                        <div
                            onMouseDown={() => {move()}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "gray", width: "100%", height: "100%", cursor: "move"}}
                        >
                            <FontAwesomeIcon icon={faUpDownLeftRight} />
                        </div>
                        {/* chaotic neutral */}
                        <div
                            onMouseDown={() => {resize('r')}}
                            style={{display: "flex", justifyContent: "center", alignItems: "center", background: "dimgrey", width: "100%", height: "100%", cursor: "e-resize"}}
                        >
                            <FontAwesomeIcon icon={faUpDown} rotation={"90"}/>
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
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} rotation={"90"}/>
                        </div>
                    </div>
                </>
            }
            {children}
        </div>
    );
}