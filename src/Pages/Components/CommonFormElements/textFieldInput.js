import { useContext } from "react";
import { AppContext } from "../appContext";

export default function TextFieldInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const {readOnly} = useContext(AppContext);

    return(
        <textarea
            style={{...props.size}}
            readOnly={readOnly}
            value={value}
            onChange={event => {onChange(event.target.value)}}
        />
    );
}