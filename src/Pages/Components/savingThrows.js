import { getStatMod } from "../Utils";
import TextFieldInput from "./CommonFormElements/textFieldInput";
import { Checkbox } from "./CommonFormElements/checkbox";

export default function SavingThrows({characterData, characterDispatch}) {
    const {proficiencies, primarySkills, proficiencyModifier, savingThrowsModifiers} = characterData;
    const dispatcher = (prof, val) => {
        characterDispatch({
            type: "change-proficiency",
            proficiency: prof,
            newValue: val,
        });
    };
    const textFieldHandler = (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
        });
    };

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
            const changeHandler = (value) => {dispatcher(skillName, value)};
            const skill = {
                even: num % 2 === 0,
                name: skillName,
                isProficient: isProficient,
                modifier: getStatMod(primarySkills[skillDep], modifier),
                changeHandler: changeHandler,
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
                    value={savingThrowsModifiers}
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
            <Checkbox
                isChecked={isProficient}
                changeHandler={changeHandler}
            />
            <div className="sheet-subscript">{modifier}</div>
            <div style={{textAlign: "left"}} className="sheet-subscript">{name}</div>
        </div>
    );
}