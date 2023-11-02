import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { EditorContext } from "../Systems/appContext";
import { open } from "@tauri-apps/api/dialog";
import { TextInput, UseEffectButton } from "../CommonFormElements";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";

export default function ImageDisplay({characterData, characterDispatch, id}) {
    const data = useMemo(
        () => {
            return characterData.elements[id] ?? {};
        },
        [characterData, id]
    );
    const [imagePath, setImagePath] = useState(convertFileSrc(data.path) ?? "");
    const imageCaption = data.text ?? "";
    const { isEditingElements } = useContext(EditorContext);


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

    const resolvePath = useCallback(
        () => {
        invoke("request_path", {path: data.path})
            .then((path) => {
                setImagePath(convertFileSrc(path));
            })
            .catch((path) => {
                setImagePath(convertFileSrc(path));
            });
        },
        [data]
    );

    useEffect(
        () => {
            resolvePath()
        },
        [resolvePath]
    );

    return (
        <div style={{display: "grid", gridTemplateRows: "auto 25px", justifyItems: "center", height: "100%", width: "100%"}}>
            {
                isEditingElements ?
                <UseEffectButton action={setPath} title={"choose file"}/>
                :
                <img alt={imagePath} style={{margin: "auto", width: "100%", height: "90%", objectFit: "contain", overflow: "hidden"}} src={imagePath} />
            }
            <TextInput value={imageCaption} onChange={captionChangeHandler} />
        </div>
    );
}