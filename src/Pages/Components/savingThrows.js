import { AppContext } from "./appContext";
import { getStatMod } from "../Utils";
import { useContext } from "react";
import TextFieldInput from "./CommonFormElements/textFieldInput";

export default function SavingThrows({proficiencies, skills, proficiencyModifier, dispatcher, textFieldValue, textFieldHandler}) {
    const context = useContext(AppContext);

    const skillList = {
        "Strength": "str",
        "Dexterity": "dex",
        "Constitution": "con",
        "Intelligence": "int",
        "Wisdom": "wis",
        "Charisma": "cha",
    };
    const savingThrowRows = Object.entries(skillList).map(
        ([skillName, skillDep], num) => {
            const isProficient = proficiencies[skillName] ?? false;
            const modifier = (proficiencies[skillName] ?? 0) * proficiencyModifier;
            const changeHandler = context.readOnly ? () => {} : () => {dispatcher(skillName, isProficient ? 0 : 1)};
            const skill = {
                even: num % 2 === 0,
                name: skillName,
                isProficient: isProficient,
                modifier: getStatMod(skills[skillDep], modifier),
                changeHandler: () => {changeHandler()},
            }
            return (<SavingThrowRow skill={skill} key={skillDep}/>);
        }
    )

    return (
        <div style={{
            "height": "100%",
            "display": "grid",
            "gridTemplateColumns": "45% 55%",
            "gridTemplateRows": "repeat(7, 1fr)",
            "justifyContent": "space-around",
        }}>
            <div className="sheet-title">saving throws</div>
            <div className="sheet-title">saving throw modifiers</div>
            {savingThrowRows}
            <div style={{gridArea: "2 / 2 / -1 / 3"}}>
                <TextFieldInput
                    value={textFieldValue}
                    onChange={(newValue)=>{textFieldHandler({"savingThrowsModifiers": newValue})}}
                />
            </div>
        </div>
    );
}

function SavingThrowRow({skill}) {
    const {isProficient, changeHandler, name, modifier, even} = skill;
    return (
        <div style={{
                "background": (even ? "#eeeeee" : "#e0e0e0"),
                "display": "grid",
                "gridTemplateColumns": "20px 1fr 2fr",
                "paddingTop": "5px",
            }}
        >
            <input
                type="checkbox"
                style={{
                    position: "relative",
                    "width": "15px",
                    "height": "15px",
                }}
                checked={isProficient}
                onChange={changeHandler}
            />
            <div className="sheet-subscript">{modifier}</div>
            <div style={{textAlign: "left"}} className="sheet-subscript">{name}</div>
        </div>
    );
}