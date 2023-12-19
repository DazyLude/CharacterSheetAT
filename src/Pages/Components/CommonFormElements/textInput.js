import { createElement, useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../Systems/appContext";

export function TextInput({value, onChange, style}) {
    const {readOnly} = useContext(EditorContext);
    onChange ??= ((e) => {});
    return createElement(TextInputNoContext, {value, onChange, style, readOnly})
}

export function TextInputNoContext({value, onChange, style, readOnly}) {
    const [selectionStart, setSelectionStart] = useState(0);
    value ??= "";
    const [oldValue, setOldValue] = useState(value);
    const elementRef = useRef(null);
    readOnly ??= false;
    onChange ??= ((e) => {});

    useEffect(
        () => {
            const input = elementRef.current;
            if (input != null) {
                const lenDiff = oldValue.length - value.length;
                input.setSelectionRange(selectionStart - lenDiff, selectionStart - lenDiff);
            }
        },
        [elementRef, selectionStart, value, oldValue]
    )

    return(
        <input
            ref={elementRef}
            type="text"
            value={value}
            style={style}
            onChange={
                (e) => {
                    if(!readOnly) {
                        setSelectionStart(e.target.selectionStart);
                        onChange(e.target.value);
                        setOldValue(e.target.value);
                    }
                }
            }
        />
    );
}
