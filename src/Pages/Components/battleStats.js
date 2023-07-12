import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";

export default function BattleStats(props) {
    return (
        <div style={{
            "height": "100%",
            "display": "grid",
            "alignItems": "center",
            "gridTemplateColumns": "1fr 1fr"
        }}>
            <div>
                <div className="sheet-title">initiative</div>
                <div className="form-big">
                    <TextInput
                        value={props.initiative}
                        onChange={(newValue)=>{props.changeHandler({"initiative": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">armor</div>
                <div className="form-big">
                    <NumberInput
                        value={props.armorClass}
                        onChange={(newValue)=>{props.changeHandler({"armorClass": newValue})}}
                    />
                </div>
                <div className="sheet-title">class</div>
            </div>
        </div>
    );
}