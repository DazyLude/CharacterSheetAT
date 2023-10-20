import { NumberInput } from "../CommonFormElements";

export default function HealthStats({characterData, characterDispatch}) {
    const { health } = characterData.globals ?? {};
    const maxHp = health.maxHp ?? 0;
    const currentHp = health.currentHp ?? 0;
    const tempHp = health.tempHp ?? 0;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "global-merge",
            name: "health",
            value: merge,
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
                        value={maxHp}
                        onChange={(newValue)=>{changeHandler({"maxHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">current</div>
                <div className="form-big">
                    <NumberInput
                            value={currentHp}
                            onChange={(newValue)=>{changeHandler({"currentHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">temporary</div>
                <div className="form-big">
                    <NumberInput
                            value={tempHp}
                            onChange={(newValue)=>{changeHandler({"tempHp": newValue})}}
                    />
                </div>
            </div>
        </div>
    );
}