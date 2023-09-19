import { useContext } from "react";
import { AppContext } from "../appContext";

export default function TextInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const {readOnly} = useContext(AppContext);

    return(
        <>
            <input
                type="text"
                value={value}
                style={props.style}
                onChange={event => {if (!readOnly) {onChange(event.target.value)}}}
            />
        </>
    );
}
