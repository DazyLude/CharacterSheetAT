import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextFieldInput({value, onChange, size}) {
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
        <textarea
            style={{...size}}
            readOnly={readOnly}
            value={value}
            ref={elementRef}
            onFocus={(e) => {e.target.selectionStart = selectionStart}}
            onChange={(e) => {if(!readOnly) {setSelectionStart(e.target.selectionStart); onChange(e.target.value);}}}
        />
    );
}