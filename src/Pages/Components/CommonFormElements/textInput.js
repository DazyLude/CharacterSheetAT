import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export default function TextInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const {readOnly} = useContext(EditorContext);

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
