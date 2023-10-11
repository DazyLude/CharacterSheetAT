import { memo, useContext, createElement } from "react";
import { AppContext } from "../appContext";

export default function AbilitySaveInterface({characterData, characterDispatch, id}) {
    const ability = characterData.gridElements[id].stat;
    const { proficiencyModifier, primarySkills } = characterData;
    const AbilitySaveDCMemo = memo(AbilitySaveDC);
    return createElement(AbilitySaveDCMemo, {ability, proficiencyModifier, primarySkills, characterDispatch, id});
}

function AbilitySaveDC({ability, proficiencyModifier, primarySkills, characterDispatch, id}) {
    const {isEditingElements} = useContext(AppContext);

    const changeHandler = (value) => {
        characterDispatch({type: "change-grid-element", merge: {stat: value}, id});
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
                    {8 + proficiencyModifier + Math.floor((primarySkills[ability] - 10)/2)}
                    {" "}
                    {ability}
                </div>
            </>
        }
        </>
    );
}