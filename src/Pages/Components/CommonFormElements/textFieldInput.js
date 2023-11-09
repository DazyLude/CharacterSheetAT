import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextFieldInput({value, onChange, size}) {
    value ??= "";
    onChange ??= ((e) => {});
    const [internalValue, setInternalValue] = useState(value);
    const {readOnly} = useContext(EditorContext);

    useEffect(
        () => {
            setInternalValue(value);
        },
        [value]
    )

    return(
        <textarea
            style={{...size}}
            readOnly={readOnly}
            value={internalValue}
            onBlur={(_e) => {if (internalValue !== value) {onChange(internalValue)}}}
            onChange={
                (e) => {
                    if(!readOnly) {
                        setInternalValue(e.target.value);
                    }
                }
            }
        />
    );
}