import TextInput from "./CommonFormElements/textInput";

export default function HitdiceTracker(props) {
    return (
        <div style={{
            "textAlign": "center",
            "alignItems": "center",
            "background": "#eeeeee",
            "paddingTop": "18px",
            ...props.placement,
        }}>
            <div className="sheet-title">hit dice</div>
            <div className="form-big">
                <TextInput
                    value={props.hitDice}
                    onChange={(newValue)=>{props.changeHandler({"hitDice": newValue})}}
                    readOnly={props.readOnly}
                />
            </div>
        </div>
    );
}