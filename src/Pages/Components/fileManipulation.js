import { UseEffectButton } from "./CommonFormElements";

import { invoke } from "@tauri-apps/api";
import { listen } from '@tauri-apps/api/event';

export default function FileManipulation({characterDispatch, characterData}) {
    return (
        <div style={{
            position: "absolute",
            display: "grid",
            zIndex: "10"
        }}>
            <UseEffectButton title={"clear local storage"} action={() => {localStorage.clear()}} />
            <UseEffectButton title={"save character sheet"} action={() => {saveCharacterToFile(characterData)}} />
            <UseEffectButton title={"load character sheet"} action={() => {getDataFromTauri(characterDispatch)}} />
        </div>
    );
}

function saveCharacterToFile(data) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('download', 'characterData.json');
    a.click();
    return () => {a.remove();};
}

function getDataFromTauri(characterDispatch) {
    invoke('get_character_sheet');
    const onLoad = (e) => {
        const data = e.payload.data;
        if (data !== undefined) {
            localStorage.setItem("characterData", JSON.stringify(data));
            characterDispatch({type: "load-from-disk", data: data});
        }
    }
    return listen("new_character_sheet", onLoad);
}