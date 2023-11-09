import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextInput({value, onChange, style}) {
    const [selectionStart, setSelectionStart] = useState(0);
    value ??= "";
    const [oldValue, setOldValue] = useState(value);
    const elementRef = useRef(null);
    const {readOnly} = useContext(EditorContext);
    onChange ??= ((e) => {});

    useEffect(
        () => {
            const input = elementRef.current;
            if (input != null) {
                const lenDiff = oldValue.length - value.length;
                input.setSelectionRange(selectionStart - lenDiff, selectionStart - lenDiff);
            }
        },
        [elementRef, selectionStart, value]
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
