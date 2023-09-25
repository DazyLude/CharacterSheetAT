import { useContext } from "react";
import { getStatMod } from "../../Utils";
import { Checkbox } from "../CommonFormElements/checkbox";
import NumberInput from "../CommonFormElements/numberInput";
import { AppContext } from "../appContext";

export default function SecondarySkills({characterData, characterDispatch}) {
    const {primarySkills, proficiencies, proficiencyModifier} = characterData;
    const changeHandler = (prof, val) => {
        characterDispatch({
            type: "change-proficiency",
            proficiency: prof,
            newValue: val,
        })
    }

    const skillList = {
        "acrobatics": "dex",
        "animal Handling": "cha",
        "arcana": "int",
        "athletics": "str",
        "deception": "cha",
        "history": "int",
        "insight": "wis",
        "intimidation": "cha",
        "investigation": "int",
        "medicine": "wis",
        "nature": "int",
        "perception": "wis",
        "performance": "cha",
        "persuasion": "cha",
        "religion": "int",
        "sleight of hand": "dex",
        "stealth": "dex",
        "survival": "wis",
    };
    const skills = Object.entries(skillList).map(
        ([skillName, skillDep]) => {
            const typeOfProficiency = typeof(proficiencies[skillName]);
            let isProficient = false;   // default for undefined
            let modifier = 0;           // default for undefined
            if (typeOfProficiency === "boolean") {  // default case for initialized proficiencies
                isProficient = proficiencies[skillName];
                modifier = proficiencyModifier * (isProficient ? 1 : 0);
            }
            else if (typeOfProficiency === "number") {  // customized case for multiplicative proficiency bonuses such as expertise
                isProficient = true;
                modifier = proficiencyModifier * proficiencies[skillName];
            } else if (typeOfProficiency === "object") {
                isProficient = true;
                const profObj = proficiencies[skillName] ?? {add: 0, mul: 1};
                const add = profObj.add ?? 0;
                const mul = profObj.mul ?? 1;
                modifier = proficiencyModifier * mul + add;
            }

            const skillChangeHandler = (value) => {
                if (typeof(value) === "boolean") {
                    changeHandler(skillName, value);
                } else if ((value.add ?? 0) === 0 && value.mul === 0) {
                    changeHandler(skillName, false);
                } else if ((value.add ?? 0) === 0 && value.mul === 1) {
                    changeHandler(skillName, true);
                } else {
                    changeHandler(skillName, value);
                }
            };
            return {
                name: skillName,
                prof: proficiencies[skillName],
                mod: getStatMod(primarySkills[skillDep], modifier),
                dep: skillDep,
                changeHandler: skillChangeHandler,
            }
        }
    )
    const rows = skills.map(
        (skill, count) => {
            return <SecondarySkillRow skill={skill} key={skill.name} even={count%2===0}/>;
        }
    )
    return (
        <>
            <div
                id="secondary-skills"
                style={{
                    "height": "100%",
                    "display": "grid",
                    "rowGap": "5px",
                    "paddingTop": "1px",
                }}
            >
                <div className="sheet-title">skills</div>
                {rows}
            </div>
        </>
    );
}

function SecondarySkillRow(props) {
    const {isEditingElements} = useContext(AppContext);
    const skill = props.skill ?? {};
    const proficiency = skill.prof ?? false;
    const modifier = skill.mod ?? 0;
    const skillName = skill.name ?? "skill";
    const mainSkill = skill.dep ?? "str";
    if (isEditingElements) {
        return (
            <div
                className={(isEditingElements ? "sheet-subscript" : "sheet-text")}
                style={{
                    "display": "grid",
                    "height": "22px",
                    "gridTemplateColumns": "35px 60px auto 40px auto",
                    "background": "#e0e0e0",
                    "paddingTop": "5px",
                }}>
                <span>{modifier}</span>
                = PM *
                <NumberInput
                    style={{width: "100%"}}
                    value={proficiency.mul ?? (proficiency ? 1 : 0)}
                    onChange={(value) => {
                        skill.changeHandler({...proficiency, mul: value})}
                    }
                />
                +
                <NumberInput
                    style={{width: "100%"}}
                    value={proficiency.add ?? 0}
                    onChange={(value) => {
                        skill.changeHandler({...proficiency, add: value})}
                    }
                />
            </div>
        );
    }   // end of isEditingElements == true
    else {
        return(
            <div
                className={(isEditingElements ? "sheet-subscript" : "sheet-text")}
                style={{
                    "display": "grid",
                    "height": "22px",
                    "gridTemplateColumns": "21px 30px auto 40px 3px",
                    "background": "#e0e0e0",
                    "paddingTop": "5px",
                }}
            >
                <Checkbox
                    isChecked={proficiency}
                    changeHandler={(value) => {skill.changeHandler(value)}}
                />
                <div>
                    {modifier}
                </div>
                <div
                    style={{
                        "textAlign": "left",
                        "textTransform": "capitalize",
                    }}
                >
                    {skillName}
                </div>
                <div
                    style={{
                        "textAlign": "right",
                        "textTransform": "uppercase",
                    }}
                >
                    {mainSkill}
                </div>
            </div>
        );
    }   // end of isEditingElements == false
}