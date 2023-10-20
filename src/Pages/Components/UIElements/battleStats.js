import { TextInput, NumberInput } from "../CommonFormElements";

export default function BattleStats({characterData, characterDispatch}) {
    let {initiative, armorClass} = characterData.globals;
    initiative ??= 0;
    armorClass ??= 0;
    const changeHandler = (name, value) => {
        characterDispatch({
            type: "global",
            name,
            value,
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
                        onChange={(newValue)=>{changeHandler("initiative", newValue)}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">armor</div>
                <div className="form-big">
                    <NumberInput
                        value={armorClass}
                        onChange={(newValue)=>{changeHandler("armorClass", newValue)}}
                    />
                </div>
                <div className="sheet-title">class</div>
            </div>
        </div>
    );
}