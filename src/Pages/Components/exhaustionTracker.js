import NumberInput from "./CommonFormElements/numberInput";

export default function HitdiceTracker(props) {
    let exhaustionTooltip = "";
    switch (props.exhaustion) { // fallthrough in this switch statement is intended
        case 6:
            exhaustionTooltip += "Death";
            break;
        case 5:
            exhaustionTooltip += "Speed reduced to 0\n"; // eslint-disable-next-line
        case 4:
            exhaustionTooltip += "Hit point maximum halved\n"; // eslint-disable-next-line
        case 3:
            exhaustionTooltip += "Disadvantage on attack rolls and saving throws\n"; // eslint-disable-next-line
        case 2:
            exhaustionTooltip += "Speed halved\n"; // eslint-disable-next-line
        case 1:
            exhaustionTooltip += "Disadvantage on ability checks\n";
            break;
        default:
            break;
    }

    return (
        <div style={{
            "textAlign": "center",
            "alignItems": "center",
            "background": "#eeeeee",
            "height": "100%",
            }}
            title={exhaustionTooltip}
        >
            <div className="sheet-title" style={{"paddingTop": "10px"}}>exhaustion</div>
            <div className="form-big">
                <NumberInput
                    value={props.exhaustion}
                    onChange={(newValue)=>{props.changeHandler({"exhaustion": newValue})}}
                />
            </div>
        </div>
    );
}