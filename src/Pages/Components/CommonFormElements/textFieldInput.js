import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextFieldInput({value, onChange, size}) {
    value ??= "";
    onChange ??= ((e) => {});
    const {readOnly} = useContext(EditorContext);

    return(
        <textarea
            style={{...size}}
            readOnly={readOnly}
            value={value}
            onChange={event => {onChange(event.target.value)}}
        />
    );
}