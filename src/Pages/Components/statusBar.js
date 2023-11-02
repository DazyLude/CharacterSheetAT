import { useContext } from "react";

import { UseEffectButton } from "./CommonFormElements";

import { EditorContext, EditorDispatchContext } from "./Systems/appContext";


export default function StatusBar() {
    const contextDispatcher = useContext(EditorDispatchContext);
    const { readOnly, isLayoutLocked, isEditingElements } = useContext(EditorContext);

    return (
        <div
            className="status-bar"
            style={{
                gridColumn: "2",
                display: "flex",
                position: "sticky",
                top: "0",
                zIndex: 10,
            }}
        >
            <UseEffectButton
                action={() => {contextDispatcher({type: "elementEdit-switch"})}}
                title={"switch element editing mode " + (isEditingElements ? "off" : "on")}
            />
            <UseEffectButton
                action={() => {contextDispatcher({type: "layoutEdit-switch"})}}
                title={"switch layout editing mode " + (isLayoutLocked ? "on" : "off")}
            />
            <UseEffectButton
                action={() => {contextDispatcher({type: "readOnly-switch"})}}
                title={"switch readonly mode " + (readOnly ? "off" : "on")}
            />
        </div>
    );
};