import { useContext, useState } from "react";

import FileManipulation from "./fileManipulation";
import ElementEditor from "./elementConstructor";

import UseEffectButton from "./useEffectButton";

import { AppDispatchContext } from "./appContext";


export default function StatusBar({characterData, characterDispatch}) {
    const contextDispatcher = useContext(AppDispatchContext);
    const [openedMenu, setOpenedMenu] = useState(0);
    const openMenu = (n) => {if (openedMenu!==n) {setOpenedMenu(n)} else {setOpenedMenu(0)}}

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
            <SpoilerButton text="file" isOpen={openedMenu===1} clickHandler={() => {openMenu(1)}}>
                <FileManipulation characterDispatch={characterDispatch} characterData={characterData}/>
            </SpoilerButton>
            <SpoilerButton text="add/remove element" isOpen={openedMenu===2} clickHandler={() => {openMenu(2)}}>
                <ElementEditor
                    dispatch={characterDispatch}
                    usedKeys={Object.keys(characterData.gridElements)}
                />
            </SpoilerButton>
            <UseEffectButton
                action={() => {contextDispatcher({type: "elementEdit-switch"})}}
                title={"switch element editing mode"}
            />
            <UseEffectButton
                action={() => {contextDispatcher({type: "layoutEdit-switch"})}}
                title={"switch layout editing mode"}
            />
            <UseEffectButton
                action={() => {contextDispatcher({type: "readOnly-switch"})}}
                title={"switch readonly mode"}
            />
        </div>
    );
};

const fancyArrow = (rotation) => (<svg style={{transform: "rotate(" + rotation + ")"}} width="16" height="16" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.268 0.999998C11.0378 -0.333335 12.9623 -0.333333 13.7321 1L23.2583 17.5C24.0281 18.8333 23.0659 20.5 21.5263 20.5H2.47372C0.934118 20.5 -0.0281307 18.8333 0.74167 17.5L10.268 0.999998Z" fill="#888888"/>
</svg>);

function SpoilerButton({children, isOpen, clickHandler, text}) {
    return (
        <div>
            <button className="spoiler-button"
                onClick={() => {clickHandler()}}
                style={{
                    display: "grid", gridTemplateColumns: "auto 16px", height: "100%", columnGap: "20px", alignItems: "center", justifyContent: "end"
                }}
            > {text}{fancyArrow(isOpen ? "0turn" : "0.5turn")}
            </button>
            <div style={{display: isOpen ? "block" : "none"}}>{children}</div>
        </div>
    );
}