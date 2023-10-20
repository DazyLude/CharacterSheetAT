import { TextInput } from "../CommonFormElements";

export default function HitdiceTracker({characterData, characterDispatch}) {
    const { hitdice } = characterData.globals ?? {};
    const hitdiceTotal = hitdice.hitdiceTotal ?? "0d8";
    const hitdiceCurrent = hitdice.hitdiceCurrent ?? "0d8";
    const changeHandler= (merge) => {
        characterDispatch({
            type: "global-merge",
            name: "hitdice",
            value: merge,
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
                    value={hitdiceTotal}
                    onChange={(newValue)=>{changeHandler({"hitdiceTotal": newValue})}}
                />
            </span>
            <div style={{gridColumn:"1/-1"}} className="form-big">
                <TextInput
                    value={hitdiceCurrent}
                    onChange={(newValue)=>{changeHandler({"hitdiceCurrent": newValue})}}
                />
            </div>
        </div>
    );
}