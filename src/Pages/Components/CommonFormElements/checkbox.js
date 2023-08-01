import { useContext } from "react";
import { AppContext } from "../appContext";

export function Checkbox({isChecked, changeHandler, style}) {
    const { readOnly } = useContext(AppContext);
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