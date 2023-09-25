import NumberInput from "../CommonFormElements/numberInput";

export default function ProficiencyModifier({characterData, characterDispatch}) {
    const { proficiencyModifier } = characterData;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
        });
    };

    return (
        <>
            <div className="sheet-title" style={{"paddingTop": "10px"}}>Proficiency modifier</div>
            <div className="form-big" style={{textAlign: "left", display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                <div style={{textAlign: "right", userSelect: "none"}}>+</div>
                <NumberInput
                    value={proficiencyModifier}
                    onChange={(newValue)=>{changeHandler({"proficiencyModifier": newValue})}}
                />
            </div>
        </>
    );
}