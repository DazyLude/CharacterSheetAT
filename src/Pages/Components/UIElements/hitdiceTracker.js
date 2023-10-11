import { TextInput } from "../CommonFormElements";

export default function HitdiceTracker({characterData, characterDispatch}) {
    const { hitDice, hitDiceTotal } = characterData;
    const changeHandler= (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
        });
    };
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
                    value={hitDiceTotal}
                    onChange={(newValue)=>{changeHandler({"hitDiceTotal": newValue})}}
                />
            </span>
            <div style={{gridColumn:"1/-1"}} className="form-big">
                <TextInput
                    value={hitDice}
                    onChange={(newValue)=>{changeHandler({"hitDice": newValue})}}
                />
            </div>
        </div>
    );
}