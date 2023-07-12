import TextInput from "./CommonFormElements/textInput";

export default function HitdiceTracker(props) {
    return (
        <div style={{
            "textAlign": "center",
            "alignItems": "center",
            "display": "grid",
            "gridTemplateColumns": "1fr 1fr",
        }}>
            <div style={{gridColumn:"1/-1", paddingTop:"5px"}} className="sheet-title">hit dice</div>
            <span className="sheet-text">total: </span>
            <span className="form-text">
                <TextInput
                    value={props.hitDiceTotal}
                    onChange={(newValue)=>{props.changeHandler({"hitDiceTotal": newValue})}}
                />
            </span>
            <div style={{gridColumn:"1/-1"}} className="form-big">
                <TextInput
                    value={props.hitDice}
                    onChange={(newValue)=>{props.changeHandler({"hitDice": newValue})}}
                />
            </div>
        </div>
    );
}