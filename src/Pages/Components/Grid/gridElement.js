import { useContext } from "react";
import { AppContext } from "../appContext";
import { GridContext, GridContextReducer } from "./gridContext";
export default function GridElement({id, children}) {
    const { isLayoutLocked } = useContext(AppContext);
    const { x, y, h, w } = useContext(GridContext)[id] ?? { x: 1, y: 1, w: 1, h: 1 };
    const gridReducer = useContext(GridContextReducer);

    const resizeInDirection = (direction) => {
        gridReducer("resizeStart", {id, direction});
        const release = () => {
            gridReducer("release", {});
        }
        window.addEventListener("mouseup", release, {once: true});
        window.addEventListener("touchend", release, {once: true});
    };

    const move = () => {
        gridReducer("moveStart", {id});
        const release = () => {
            gridReducer("release", {});
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
                        background: "gray",
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
                        <div onMouseDown={() => {resizeInDirection('ul')}} style={{width: "100%", height: "100%", cursor: "nw-resize"}}></div>
                        {/* neutral good */}
                        <div onMouseDown={() => {resizeInDirection('u')}} style={{width: "100%", height: "100%", cursor: "n-resize"}}></div>
                        {/* top right */}
                        <div onMouseDown={() => {resizeInDirection('ur')}} style={{width: "100%", height: "100%", cursor: "ne-resize"}}></div>
                        {/* lawful neutral */}
                        <div onMouseDown={() => {resizeInDirection('l')}} style={{width: "100%", height: "100%", cursor: "w-resize"}}></div>
                        {/* center */}
                        <div onMouseDown={() => {move()}} style={{width: "100%", height: "100%", cursor: "move"}}></div>
                        {/* chaotic neutral */}
                        <div onMouseDown={() => {resizeInDirection('r')}} style={{width: "100%", height: "100%", cursor: "e-resize"}}></div>
                        {/* bottom left */}
                        <div onMouseDown={() => {resizeInDirection('ld')}} style={{width: "100%", height: "100%", cursor: "sw-resize"}}></div>
                        {/* neutral evil */}
                        <div onMouseDown={() => {resizeInDirection('d')}} style={{width: "100%", height: "100%", cursor: "s-resize"}}></div>
                        {/* bottom right */}
                        <div onMouseDown={() => {resizeInDirection('rd')}} style={{width: "100%", height: "100%", cursor: "se-resize"}}></div>
                    </div>
                </>
            }
            {children}
        </div>
    );
}