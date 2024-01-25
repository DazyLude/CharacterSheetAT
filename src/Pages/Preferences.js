import { useCallback, useEffect, useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api";
import { UseEffectButton } from "../Pages/Components/CommonFormElements";

export default function DataExplorer() {
    const [data, setData] = useState({});

    useEffect(
        () => {
            invoke("request_data", { requestedData: "config" })
                .then((e) => {
                    setData(e.data)
                })
                .catch((e) => console.error(e));
        },
        []
    );

    const save = useCallback(
        () => {
            invoke("call", { code: "save_config" })
                .then((e) => console.log(e))
                .catch((e) => console.error(e));
        },
        []
    );

    const keybindings = useMemo(
        () => {
            let arr = [];
            if (data?.shortcuts == null) return arr;
            console.log(data);
            for (const [key, val] of Object.entries(data.shortcuts)) {
                console.log(key, val);
                arr.push(<tr><td>{key}</td><td><BindingSelector key={key} value={val} /></td></tr>);
            }
            return arr;
        },
        [data]
    );


    return (
        <>
            <table>
                <tr><td colSpan={2}>shortcuts</td></tr>
                <tr><td>action</td><td>keybinding</td></tr>
                {keybindings}
                <tr><td colSpan={2}>settings</td></tr>
                <tr><td></td><td><UseEffectButton action={save} title={"save"} /></td></tr>
            </table>
        </>
    );
}

function BindingSelector({ value, setBindingCallback }) {
    const ctrl = value?.ctrl_key ?? false;
    const alt = value?.alt_key ?? false;
    const shift = value?.shift_key ?? false;
    const code = value?.key_code ?? "none";
    setBindingCallback ??= () => { };

    const [isRecording, setRecording] = useState(false);
    const [binding, setBinding] = useState({key: "none"});

    useEffect(
        () => {
            const onKeyDown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isRecording) {
                    setBinding({
                        ctrl: e.ctrlKey ?? false,
                        alt: e.altKey ?? false,
                        shift: e.shiftKey ?? false,
                        key: e.code ?? "none"
                    });
                }
            }
            window.addEventListener("keydown", onKeyDown);
            return () => { window.removeEventListener("keydown", onKeyDown) };
        },
        [isRecording, binding]
    )

    if (!isRecording) {
        return (
            <div onClick={() => { setRecording(true) }}>
                {(ctrl ? "ctrl + " : "") + (alt ? "alt + " : "") + (shift ? "shift + " : "") + code}
            </div>
        )
    }
    return (
        <div>
            {(binding.ctrl ? "ctrl + " : "") + (binding.alt ? "alt + " : "") + (binding.shift ? "shift + " : "") + binding.key}
            <button onClick={() => { setBindingCallback(binding) }}>save</button>
            <button onClick={() => { setRecording(false) }}>cancel</button>
        </div>
    );
}