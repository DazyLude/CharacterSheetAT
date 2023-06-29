import { useContext } from "react";
import { AppContext } from "../appContext";

export default function NumberInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const { readOnly } = useContext(AppContext);

    return(
        <>
            {readOnly ? (<div>{value}</div>) : (
                <input
                    type="text"
                    value={value}
                    onChange={event => {
                        const newValue = parseInt(event.target.value);
                        onChange(isNaN(newValue) ? event.target.value : newValue);
                    }}
                />
            )}
        </>
    );
}