import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export function NumberInput({style, onChange, value}) {
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
                console.log(event.target.value);
                const value = event.target.value;
                const parsedValue = parseFloat(value);
                onChange(isNaN(parsedValue) ? value : parsedValue);
            }}
        />
    );
}

export function NumberInputWithPostfix({style, onChange, value, postfix}) {
    return (
        <div style={{"display": "flex", ...style}}>
            <NumberInput onChange={onChange} value={value} />
            {postfix}
        </div>
    );
}