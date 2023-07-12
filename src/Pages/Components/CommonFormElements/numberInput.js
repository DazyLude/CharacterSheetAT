import { useContext } from "react";
import { AppContext } from "../appContext";

export default function NumberInput({style, onChange, value}) {
    value = value ?? "";
    onChange = onChange ?? ((e) => {});
    const { readOnly } = useContext(AppContext);

    return(
        <>
            {readOnly ? (<div>{value}</div>) : (
                <input
                    style={style}
                    type="text"
                    value={value}
                    onChange={event => {
                        const newValue = parseFloat(event.target.value);
                        onChange(isNaN(newValue) ? event.target.value : newValue);
                    }}
                />
            )}
        </>
    );
}