import { useContext, useEffect } from "react";
import { AppContext } from "../Systems/appContext";
import { open } from "@tauri-apps/api/dialog";
import { TextInput, UseEffectButton } from "../CommonFormElements";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export default function ImageDisplay({characterData, characterDispatch, id}) {
    const data = characterData.elements[id] ?? {};
    let imagePath = convertFileSrc(data.path) ?? "";
    const imageCaption = data.text ?? "";
    const { isEditingElements } = useContext(AppContext);


    const imageChangeHandler = (value) => {
        characterDispatch({
            type: "element-merge",
            value: {path: value},
            id
        });
    };
    const captionChangeHandler = (value) => {
        characterDispatch({
            type: "element-merge",
            value: {text: value},
            id
        })
    };

    const setPath = () => {
        open()
            .then((path) => {
                const providedPath = path;
                if (providedPath === null) {
                    return;
                }
                console.log(data.path);
                console.log(providedPath);
                imageChangeHandler(providedPath);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div style={{display: "grid", gridTemplateRows: "auto 25px", justifyItems: "center", height: "100%", width: "100%"}}>
            {
                isEditingElements ?
                <UseEffectButton action={setPath} title={"choose file"}/>
                :
                <img style={{margin: "auto", width: "100%", height: "90%", objectFit: "contain", overflow: "hidden"}} src={imagePath} />
            }
            <TextInput value={imageCaption} onChange={captionChangeHandler} />
        </div>
    );
}