import { memo, useContext, createElement } from "react";
import { EditorContext } from "../Systems/appContext";

export default function AbilitySaveInterface({characterData, characterDispatch, id}) {
    let data = characterData.elements[id] ?? {}
    const ability = data.stat ??= "cha";
    const proficiencyModifier = characterData.globals.proficiencyModifier ?? 0;
    const stats = characterData.globals.stats ?? {};
    const AbilitySaveDCMemo = memo(AbilitySaveDC);
    return createElement(AbilitySaveDCMemo, {ability, proficiencyModifier, stats, characterDispatch, id});
}

function AbilitySaveDC({ability, proficiencyModifier, stats, characterDispatch, id}) {
    const {isEditingElements} = useContext(EditorContext);

    const changeHandler = (value) => {
        characterDispatch({type: "element", name: "stat", value, id});
    };

    const abilityOptions = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => {
        return <option key={ability} value={ability}>{ability}</option>;
    });

    return (
        <>
        {isEditingElements ?
            <>
                <div className="sheet-subscript">choose casting ability</div>
                <select style={{margin: "5px"}} value={ability} onChange={(e) => {changeHandler(e.target.value)}}>
                    {abilityOptions}
                </select>
            </>
        :
            <>
                <div className="sheet-title" style={{"paddingTop": "10px"}}>Ability save DC</div>
                <div className="sheet-big">
                    {8 + (proficiencyModifier ?? 0) + Math.floor(((stats[ability] ?? 0) - 10)/2)}
                    {" "}
                    {ability}
                </div>
            </>
        }
        </>
    );
}