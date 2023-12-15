import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export default function Checkbox({value, onChange, style}) {
    const { readOnly } = useContext(EditorContext);
    return (<input
        type="checkbox"
        style={{
            "width": "15px",
            "height": "15px",
            ...style,
        }}
        checked={value}
        onChange={readOnly ? () => {} : () => {onChange(!value)}}
    />);
}