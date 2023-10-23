import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Systems/appContext";
import { open } from "@tauri-apps/api/dialog";
import { TextInput, UseEffectButton } from "../CommonFormElements";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";

export default function ImageDisplay({characterData, characterDispatch, id}) {
    const data = characterData.elements[id] ?? {};
    const [imagePath, setImagePath] = useState(convertFileSrc(data.path) ?? "");
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
        const openCallback = (path) => {
            const providedPath = path;
            if (providedPath === null) {
                return;
            }
            invoke("make_path_relative", {path: providedPath})
                .then((relative_path) => {
                    imageChangeHandler(relative_path);
                })
                .catch((absolute_path) => {
                    console.error("Provided path is not in the same/children directory relative to the json: " + absolute_path);
                    imageChangeHandler(absolute_path);
                });
        }

        open()
            .then(openCallback)
            .catch((error) => {
                console.error(error);
            });
    }

    const resolvePath = () => {
        invoke("request_path", {path: data.path})
            .then((path) => {
                setImagePath(convertFileSrc(path));
            })
            .catch((path) => {
                setImagePath(convertFileSrc(path));
            });
    }

    useEffect(
        () => {
            resolvePath()
        },
        [data]
    );

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