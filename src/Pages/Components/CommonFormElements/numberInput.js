import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export default function NumberInput({style, onChange, value}) {
    value = value ?? "";
    onChange = onChange ?? ((e) => {});
    const { readOnly } = useContext(EditorContext);

    return(
        <input
            style={style}
            type="text"
            value={value}
            onChange={event => {
                if (readOnly) return;
                const newValue = parseFloat(event.target.value);
                onChange(isNaN(newValue) ? event.target.value : newValue);
            }}
        />
    );
}