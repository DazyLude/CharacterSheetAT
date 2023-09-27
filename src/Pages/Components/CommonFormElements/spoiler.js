import { useState } from "react";

export function Spoiler({children, preview, hideText, showText}) {
    let [isOpen, setIsOpen] = useState(false);

    return(
        <ControlledSpoiler
            hideText={hideText}
            showText={showText}
            preview={preview}
            isOpen={isOpen}
            stateHandler={() => {setIsOpen(!isOpen)}}
        >
            {children}
        </ControlledSpoiler>
    );
}

export function ControlledSpoiler({children, preview, hideText, showText, isOpen, stateHandler}) {
    hideText ??= "hide";
    showText ??= "more";

    if (isOpen) {
        return (
            <div style={{height: "30px"}}>
                <div style={{
                    position: "absolute",
                }}>
                    {children}
                    <button onClick={() => {stateHandler()}}> {hideText} </button>
                </div>
            </div>
        );
    }
    else {
        return (
            <div style={{height: "30px"}}>
                {preview}
                <button style={{padding: "5px 10px", width: "30%"}} onClick={() => {stateHandler()}}> {showText} </button>
            </div>
        );
    }
}
