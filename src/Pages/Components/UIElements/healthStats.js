import { NumberInput } from "../CommonFormElements";

export default function HealthStats({characterData, characterDispatch}) {
    const {health} = characterData;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
            fieldName: "health",
        });
    };
    return (
        <div style={{
            "display": "grid",
            "gridTemplateColumns": "1fr 1fr 1fr",
            "gridTemplateRows": "30px auto",
            "rowGap": "10px",
            "alignItems": "start",
            "justifyItems": "center",
        }}>
            <div className="sheet-title" style={{gridColumn: "1/-1", alignSelf: "end"}}>Health</div>
            <div>
                <div className="sheet-title">maximum</div>
                <div className="form-big">
                    <NumberInput
                        value={health.maxHp}
                        onChange={(newValue)=>{changeHandler({"maxHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">current</div>
                <div className="form-big">
                    <NumberInput
                            value={health.currentHp}
                            onChange={(newValue)=>{changeHandler({"currentHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">temporary</div>
                <div className="form-big">
                    <NumberInput
                            value={health.tempHp}
                            onChange={(newValue)=>{changeHandler({"tempHp": newValue})}}
                    />
                </div>
            </div>
        </div>
    );
}