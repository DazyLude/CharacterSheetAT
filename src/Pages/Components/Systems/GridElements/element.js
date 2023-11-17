import { useContext, useCallback, useMemo, createElement } from "react";

import { EditorContext } from "../appContext";
import { placementStringFromXYWH, dispatcher } from "../../../Utils";

import { GridControllerContext } from "./context";

export function GridElement({id, children, position}) {
    const gridControllerCallback = useContext(GridControllerContext);
    const { isLayoutLocked } = useContext(EditorContext);
    const { x, y, h, w } = position;
    const placement = placementStringFromXYWH({ x, y, h, w });

    const move = useCallback(
        () => {
            gridControllerCallback({callerId: id, direction: "", initialPlacement: {...position}});
        },
        [gridControllerCallback, id, position]
    );

    const resize = useCallback(
        (direction) => {
            gridControllerCallback({callerId: id, direction, initialPlacement: {...position}});
        },
        [gridControllerCallback, id, position]
    );

    const remove = useCallback(
        () => {
            dispatcher({type: "remove", id});
        },
        [id]
    )

    let unlockedElement = useMemo(
        () => {
            return createElement(GridElementOOC, {move, resize, remove, id});
        },
        [move, resize, id]
    )

    return (
        <div className="grid-element" style={{position: "relative", gridArea: placement}}>
            {isLayoutLocked ? children : unlockedElement}
        </div>
    )
};

export function GridElementOOC({move, resize, remove, id, style}) {
    return (
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
            ...style
            }}
            className="form-subscript"
            title={id}
        >
            {/* top left */}
            <div
                onMouseDown={() => {resize('ul')}}
                style={{background: "gray", width: "100%", height: "100%", cursor: "nw-resize"}}
            >
            </div>
            {/* neutral good */}
            <div
                onMouseDown={() => {resize('u')}}
                style={{background: "dimgrey", width: "100%", height: "100%", cursor: "n-resize"}}
            >
            </div>
            {/* top right */}
            <div
                onMouseDown={() => {resize('ur')}}
                style={{background: "gray", width: "100%", height: "100%", cursor: "ne-resize"}}
            >
            </div>
            {/* lawful neutral */}
            <div
                onMouseDown={() => {resize('l')}}
                style={{background: "dimgrey", width: "100%", height: "100%", cursor: "w-resize"}}
            >
            </div>
            {/* center */}
            <div
                onMouseDown={() => {move()}}
                style={{background: "gray", width: "100%", height: "100%", cursor: "move"}}
            >
                {
                    remove == null ?
                    null
                    :
                    <button
                        style={{position: "relative", zIndex: "4"}}
                        onMouseDown={(e) => {e.stopPropagation()}}
                        onClick={() => {remove()}}
                    >
                        x
                    </button>
                }
                {
                    id === undefined ?
                    null
                    :
                    <div style={{height: "40px", textOverflow:"ellipsis", overflow: "hidden"}}>id: {id}</div>
                }
            </div>
            {/* chaotic neutral */}
            <div
                onMouseDown={() => {resize('r')}}
                style={{background: "dimgrey", width: "100%", height: "100%", cursor: "e-resize"}}
            >
            </div>
            {/* bottom left */}
            <div
                onMouseDown={() => {resize('ld')}}
                style={{background: "gray", width: "100%", height: "100%", cursor: "sw-resize"}}
            >
            </div>
            {/* neutral evil */}
            <div
                onMouseDown={() => {resize('d')}}
                style={{background: "dimgrey", width: "100%", height: "100%", cursor: "s-resize"}}
            >
            </div>
            {/* bottom right */}
            <div
                onMouseDown={() => {resize('rd')}}
                style={{background: "gray", width: "100%", height: "100%", cursor: "se-resize"}}
            >
            </div>
        </div>
    );
}