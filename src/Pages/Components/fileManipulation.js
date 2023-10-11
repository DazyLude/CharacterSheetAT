import { UseEffectButton } from "./CommonFormElements";
import { useEffect, useState } from "react";

export default function FileManipulation({characterDispatch, characterData}) {
    const [submitCounter, setSubmitCounter] = useState(0);
    useEffect(() => {
        if (submitCounter === 0) {
            return;
        }
        pickCharacterFile(characterDispatch); // eslint-disable-next-line
    }, [submitCounter])
    return (
        <div style={{
            position: "absolute",
            display: "grid",
            zIndex: "10"
        }}>
            <UseEffectButton title={"clear local storage"} action={() => {localStorage.clear()}} />
            <UseEffectButton title={"save character sheet"} action={() => {saveCharacterToFile(characterData)}} />
            <input type="file" id="file-selector" onChange={() => {setSubmitCounter(submitCounter + 1)}} accept="application/json" style={{display:"none"}}/>
            <UseEffectButton
                title={"load character sheet"}
                action={() => {
                    document.getElementById("file-selector").click();
                }}
            />
        </div>
    );
}

function pickCharacterFile(characterDispatch) {
    const selectedFile = document.getElementById("file-selector").files[0];
    if (selectedFile === undefined) {
        return;
    }
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            console.log(reader.result);
            localStorage.setItem("characterData", reader.result);
            characterDispatch({type: "load-from-disk", data: JSON.parse(reader.result)});
        },
        false
    );
    reader.readAsText(selectedFile);
}

function saveCharacterToFile(data) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('download', 'characterData.json');
    a.click();
    return () => {a.remove();};
}