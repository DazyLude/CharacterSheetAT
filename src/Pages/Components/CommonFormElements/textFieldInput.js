import { useContext } from "react";
import { AppContext } from "../appContext";

export default function TextFieldInput({value, onChange, size}) {
    value ??= "";
    onChange ??= ((e) => {});
    const {readOnly} = useContext(AppContext);

    return(
        <textarea
            style={{...size}}
            readOnly={readOnly}
            value={value}
            onChange={event => {onChange(event.target.value)}}
        />
    );
}