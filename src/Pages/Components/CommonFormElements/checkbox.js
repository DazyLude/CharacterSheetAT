import { useContext } from "react";
import { AppContext } from "../Systems/appContext";
import { CommanderContext } from "../Systems/command";

export default function Checkbox({isChecked, changeHandler, style}) {
    const { readOnly } = useContext(AppContext);
    const { command } = useContext(CommanderContext);
    const commandObject = {
        do: () => {changeHandler(!isChecked)},
        undo: () => {changeHandler(isChecked)},
        id: "chkb",
    };
    return (<input
        type="checkbox"
        style={{
            "width": "15px",
            "height": "15px",
            ...style,
        }}
        checked={isChecked}
        onChange={readOnly ? () => {} : () => {command(commandObject)}}
    />);
}