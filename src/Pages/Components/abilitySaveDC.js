import { useContext, useState } from "react";
import { AppContext } from "./appContext";

export default function AbilitySaveDC({characterData, characterDispatch}) {
    const {isEditingElements} = useContext(AppContext);
    const [ability, setAbility] = useState("int");

    const { proficiencyModifier, primarySkills } = characterData;

    const abilityOptions = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => {
        return <option key={ability} value={ability}>{ability}</option>;
    });

    return (
        <>
        {isEditingElements ?
            <>
                <div className="sheet-subscript">choose casting ability</div>
                <select style={{margin: "5px"}} value={ability} onChange={(e) => {setAbility(e.target.value)}}>
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