import { UseEffectButton } from "./CommonFormElements";

import { invoke } from "@tauri-apps/api";

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

async function saveCharacterToFile(data) {
    invoke('save_character_sheet', {data})
        .catch((e) => console.error(e))
}

function getDataFromTauri() {
    invoke('open_character_sheet');
}