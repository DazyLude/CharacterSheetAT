import { TextInput, NumberInput } from "../CommonFormElements";

export default function BattleStats({characterData, characterDispatch}) {
    const {initiative, armorClass} = characterData;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
        });
    };
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
                        value={initiative}
                        onChange={(newValue)=>{changeHandler({"initiative": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">armor</div>
                <div className="form-big">
                    <NumberInput
                        value={armorClass}
                        onChange={(newValue)=>{changeHandler({"armorClass": newValue})}}
                    />
                </div>
                <div className="sheet-title">class</div>
            </div>
        </div>
    );
}