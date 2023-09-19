import { useContext } from "react";
import { AppContext } from "../appContext";
import { GridContext, GridContextReducer } from "./gridContext";
export default function GridElement({id, children}) {
    const { isLayoutLocked } = useContext(AppContext);
    const { x, y, h, w } = useContext(GridContext)[id] ?? { x: 1, y: 1, w: 1, h: 1 };
    const gridReducer = useContext(GridContextReducer);

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
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        textAlign: "center",
                        }}
                        className="form-subscript"
                    >
                        <div>move:</div>
                        <div onMouseDown={() => {
                                window.addEventListener("mouseup", () => {gridReducer("moveEnd")}, {once: true});
                                gridReducer("moveStart", {id});
                            }}
                            onTouchStart={() => {
                                window.addEventListener("touchend", () => {gridReducer("moveEnd")}, {once: true});
                                gridReducer("moveStart", {id});
                            }}
                            style={{
                                background: "red",
                            }}
                        >
                            hold
                        </div>
                        <div>resize up:</div>
                        <div onMouseDown={() => {
                                window.addEventListener("mouseup", () => {gridReducer("resizeEnd")}, {once: true});
                                gridReducer("resizeStart", {id, direction: 'u'});
                            }}
                            onTouchStart={() => {
                                window.addEventListener("touchend", () => {gridReducer("resizeEnd")}, {once: true});
                                gridReducer("resizeStart", {id, direction: 'u'});
                            }}
                            style={{
                                background: "red",
                            }}
                        >
                            hold
                        </div>
                    </div>
                </>
            }
            {children}
        </div>
    );
}