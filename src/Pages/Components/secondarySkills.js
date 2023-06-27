import { getStatMod} from "../Utils";

export default function SecondarySkills(props) {
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
            const isProficient = props.proficiencies[skillName] ?? false;
            const modifier = (props.proficiencies[skillName] ?? 0) * props.proficiencyModifier;
            const changeHandler = props.readOnly ? () => {} : () => {props.changeHandler(skillName, isProficient ? 0 : 1)};
            return {
                name: skillName,
                prof: isProficient,
                mod: getStatMod(props.skills[skillDep], modifier),
                dep: skillDep,
                changeHandler: () => {changeHandler()},
            }
        }
    )
    const rows = skills.map(
        (skill, count) => {
            return <SecondarySkillRow skill={skill} key={skill.name} even={count%2===0}/>;
        }
    )
    return (
        <div
            id="secondary-skills"
            style={{
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "space-around",
                "textAlign": "center",
                "padding": "5px 0px",
                ...props.placement,
            }}
        >
            <span className="sheet-title">skills</span>
            {rows}
        </div>
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
                "height": "27px",
                "paddingTop": "5px",
                "gridTemplateColumns": "21px 30px auto 40px 3px",
                "background": (props.even ? "#eeeeee" : "#f8f8f8"),
            }}
        >
            <input
                type="checkbox"
                style={{
                    position: "relative",
                    "width": "15px",
                    "height": "15px",
                }}
                checked={proficiency}
                onChange={skill.changeHandler}
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