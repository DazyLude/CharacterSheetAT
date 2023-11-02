import { useContext } from "react";
import { getStatMod } from "../../Utils";
import { Checkbox, NumberInput, Spoiler } from "../CommonFormElements";
import { EditorContext } from "../Systems/appContext";

export default function SecondarySkills({characterData, characterDispatch}) {
    const stats = characterData.globals.stats ?? {};
    const proficiencies = characterData.globals.proficiencies ?? {};
    const proficiencyModifier = characterData.globals.proficiencyModifier ?? 0;

    const changeHandler = (prof, val) => {
        const merge = {};
        merge[prof] = val;
        characterDispatch({
            type: "global-merge",
            name: "proficiencies",
            value: merge,
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
                mod: getStatMod(stats[skillDep] ?? 0, modifier),
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
    const {isEditingElements} = useContext(EditorContext);
    const skill = props.skill ?? {};
    const proficiency = skill.prof ?? false;
    const modifier = skill.mod ?? 0;
    const skillName = skill.name ?? "skill";
    const mainSkill = skill.dep ?? "str";

    const setProficient = (val) => {
        setCustom({mul: val ? 1 : 0, add: 0});
    }
    const setExpert = (val) => {
        setCustom({mul: val ? 2 : 0, add: 0});
    }
    const setCustom = ({add, mul}) => {
        skill.changeHandler({
            add: add ?? proficiency.add ?? 0,
            mul: mul ?? proficiency.mul ?? 0,
        });
    }

    if (isEditingElements) {
        return (
            <div
                className={"sheet-subscript"}
                style={{
                    "display": "grid",
                    "height": "27px",
                    "background": "#e0e0e0",
                }}>
                <Spoiler
                    preview={skillName}
                    showText={"advanced"}
                    hideText={"hide advanced"}
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "110px",
                        background: "LightGray"
                    }}>
                        <div>
                            set proficiency:
                            <Checkbox
                                isChecked={proficiency===true || (proficiency.mul === 1 && (proficiency.add ?? 0) === 0)}
                                changeHandler={(val) => {setProficient(val)}}
                            />
                        </div>
                        <div>
                            set expertise:
                            <Checkbox
                                isChecked={proficiency.mul === 2 && (proficiency.add ?? 0) === 0}
                                changeHandler={(val) => {setExpert(val)}}
                            />
                        </div>
                        or set custom modifier formula:
                        <div style={{
                            display: "flex",
                            justifyContent: "space-evenly"
                        }}>
                            {modifier} = PM *
                            <NumberInput
                                style={{width: "40px"}}
                                value={proficiency.mul ?? (proficiency === true ? 1 : 0)}
                                onChange={(value) => {
                                    setCustom({mul: value});
                                }}
                            />
                            +
                            <NumberInput
                                style={{width: "40px"}}
                                value={proficiency.add ?? 0}
                                onChange={(value) => {
                                    setCustom({add: value});
                                }}
                            />
                        </div>
                    </div>
                </Spoiler>

            </div>
        );
    }   // end of isEditingElements == true
    else {
        return(
            <div
                className={"sheet-text"}
                style={{
                    "display": "grid",
                    "height": "22px",
                    "gridTemplateColumns": "21px 30px auto 40px 3px",
                    "background": "#e0e0e0",
                    "paddingTop": "3px",
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