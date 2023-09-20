import NumberInput from "./CommonFormElements/numberInput";

export default function HitdiceTracker({characterData, characterDispatch}) {
    const { exhaustion } = characterData;
    const changeHandler= (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
        });
    };

    let exhaustionTooltip = "";
    switch (exhaustion) { // fallthrough in this switch statement is intended
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
        <div
            title={exhaustionTooltip}
        >
            <div className="sheet-title" style={{"paddingTop": "10px"}}>exhaustion</div>
            <div className="form-big">
                <NumberInput
                    value={exhaustion}
                    onChange={(newValue)=>{changeHandler({"exhaustion": newValue})}}
                />
            </div>
        </div>
    );
}