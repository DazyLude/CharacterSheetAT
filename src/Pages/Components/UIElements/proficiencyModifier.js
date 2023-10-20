import { NumberInput } from "../CommonFormElements";

export default function ProficiencyModifier({characterData, characterDispatch}) {
    const { proficiencyModifier } = characterData.globals ?? 0;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "global",
            name: "proficiencyModifier",
            value: merge,
        });
    };

    return (
        <>
            <div className="sheet-title" style={{"paddingTop": "10px"}}>Proficiency modifier</div>
            <div className="form-big" style={{textAlign: "left", display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                <div style={{textAlign: "right", userSelect: "none"}}>+</div>
                <NumberInput
                    value={proficiencyModifier}
                    onChange={(newValue)=>{changeHandler(newValue)}}
                />
            </div>
        </>
    );
}