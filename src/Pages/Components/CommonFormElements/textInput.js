import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextInput({value, onChange, style}) {
    const [selectionStart, setSelectionStart] = useState(5);
    const elementRef = useRef(null);
    const {readOnly} = useContext(EditorContext);
    onChange ??= ((e) => {});
    value ??= "";

    useEffect(
        () => {
            const input = elementRef.current;
            if (input) {
                input.setSelectionRange(selectionStart, selectionStart);
            }
        },
        [elementRef, selectionStart, value]
    )

    return(
        <>
            <input
                ref={elementRef}
                type="text"
                value={value}
                style={style}
                onChange={(e) => {if(!readOnly) {setSelectionStart(e.target.selectionStart); onChange(e.target.value);}}}
            />
        </>
    );
}
