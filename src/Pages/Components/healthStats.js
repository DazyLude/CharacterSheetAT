import NumberInput from "./CommonFormElements/numberInput";

export default function HealthStats(props) {
    return (
        <div style={{
            "textAlign": "center",
            "display": "grid",
            "gridTemplateColumns": "1fr 1fr 1fr",
            "gridTemplateRows": "30px auto",
            "rowGap": "10px",
            "alignItems": "start",
            "justifyItems": "center",
            "background": "#eeeeee",
            "padding": "5px",
            ...props.placement,
        }}>
            <div className="sheet-title" style={{gridColumn: "1/-1", alignSelf: "end"}}>Health</div>
            <div>
                <div className="sheet-title">maximum</div>
                <div className="form-big">
                    <NumberInput
                        value={props.health.maxHp}
                        onChange={(newValue)=>{props.changeHandler({"maxHp": newValue})}}
                        readOnly={props.readOnly}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">current</div>
                <div className="form-big">
                    <NumberInput
                            value={props.health.currentHp}
                            onChange={(newValue)=>{props.changeHandler({"currentHp": newValue})}}
                            readOnly={props.readOnly}
                    />
                </div>
            </div>
            <div>
                <div className="sheet-title">temporary</div>
                <div className="form-big">
                    <NumberInput
                            value={props.health.tempHp}
                            onChange={(newValue)=>{props.changeHandler({"tempHp": newValue})}}
                            readOnly={props.readOnly}
                    />
                </div>
            </div>
        </div>
    );
}