import NumberInput from "./CommonFormElements/numberInput";

export default function HealthStats(props) {
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
                        value={props.health.maxHp}
                        onChange={(newValue)=>{props.changeHandler({"maxHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">current</div>
                <div className="form-big">
                    <NumberInput
                            value={props.health.currentHp}
                            onChange={(newValue)=>{props.changeHandler({"currentHp": newValue})}}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">temporary</div>
                <div className="form-big">
                    <NumberInput
                            value={props.health.tempHp}
                            onChange={(newValue)=>{props.changeHandler({"tempHp": newValue})}}
                    />
                </div>
            </div>
        </div>
    );
}