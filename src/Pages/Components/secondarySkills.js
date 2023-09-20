import { getStatMod } from "../Utils";
import { Checkbox } from "./CommonFormElements/checkbox";

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
            const isProficient = proficiencies[skillName] ?? false;
            const modifier = (proficiencies[skillName] ?? 0) * proficiencyModifier;
            const skillChangeHandler = (value) => {changeHandler(skillName, value)};
            return {
                name: skillName,
                prof: isProficient,
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
    const skill = props.skill ?? {};
    const proficiency = skill.prof ?? false;
    const modifier = skill.mod ?? 0;
    const skillName = skill.name ?? "skill";
    const mainSkill = skill.dep ?? "str";
    return (
        <div
            className="sheet-text"
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
}