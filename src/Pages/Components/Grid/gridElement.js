import { useContext, useState } from "react";
import { AppContext } from "../appContext";
import { GridContext, GridContextReducer } from "./gridContext";
import NumberInput from "../CommonFormElements/numberInput";

export default function GridElement({id, children}) {
    const { isLayoutLocked } = useContext(AppContext);
    const { x, y, h, w } = useContext(GridContext)[id];
    const gridContextReducer = useContext(GridContextReducer);

    const placement = `${y} / ${x} / ${h === -1 ? -1 : y + h} /  ${w === -1 ? -1 : x + w}`
    const [tempX, setTempX] = useState(x);

    return (
        <div style={{position: "relative", gridArea: placement}}>
            {isLayoutLocked ? null :
                <>
                    <div style={{
                        zIndex: "1",
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
                        x:
                        <NumberInput value={x} onChange={(newValue) => {gridContextReducer({id: id, merge: {x: newValue}})}} />
                        w:
                        <NumberInput value={w} onChange={(newValue) => {gridContextReducer({id: id, merge: {w: newValue}})}} />
                        y:
                        <NumberInput value={y} onChange={(newValue) => {gridContextReducer({id: id, merge: {y: newValue}})}} />
                        h:
                        <NumberInput value={h} onChange={(newValue) => {gridContextReducer({id: id, merge: {h: newValue}})}} />
                    </div>
                </>
            }
            {children}
        </div>
    );
}