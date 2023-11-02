import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

export default function Checkbox({isChecked, changeHandler, style}) {
    const { readOnly } = useContext(EditorContext);
    return (<input
        type="checkbox"
        style={{
            "width": "15px",
            "height": "15px",
            ...style,
        }}
        checked={isChecked}
        onChange={readOnly ? () => {} : () => {changeHandler(!isChecked)}}
    />);
}