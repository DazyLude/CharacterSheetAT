import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";

export default function BattleStats(props) {
    return (
        <div style={{
            "textAlign": "center",
            "display": "grid",
            "gridTemplateColumns": "1fr 1fr",
            "alignItems": "center",
            "background": "#eeeeee",
            ...props.placement,
        }}>
            <div>
                <div className="sheet-title">initiative</div>
                <div className="form-big">
                    <TextInput
                        value={props.initiative}
                        onChange={(newValue)=>{props.changeHandler({"initiative": newValue})}}
                        readOnly={props.readOnly}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">armor</div>
                <div className="form-big">
                <NumberInput
                        value={props.armorClass}
                        onChange={(newValue)=>{props.changeHandler({"armorClass": newValue})}}
                        readOnly={props.readOnly}
                    />
                </div>
                <div className="sheet-title">class</div>
            </div>
        </div>
    );
}