import { getStatMod } from "../../Utils";
import { TextFieldInput, Checkbox } from "../CommonFormElements";

export default function SavingThrows({characterData, characterDispatch}) {
    const {proficiencies, stats, proficiencyModifier, savingThrowsModifiers} = characterData.globals;

    const dispatcher = (prof, val) => {
        const merge = {};
        merge[prof] = val;
        characterDispatch({
            type: "global-merge",
            name: "proficiencies",
            value: merge,
        })
    }

    const textFieldHandler = (merge) => {
        characterDispatch({
            type: "global",
            name: "savingThrowsModifiers",
            value: merge,
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
            const modifier = (proficiencies[skillName] ?? 0) * (proficiencyModifier ?? 0);
            const changeHandler = (value) => {dispatcher(skillName, value)};
            const skill = {
                even: num % 2 === 0,
                name: skillName,
                isProficient: isProficient,
                modifier: getStatMod(stats[skillDep] ?? 0, modifier),
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
                    onChange={(newValue)=>{textFieldHandler(newValue)}}
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
                value={isProficient}
                onChange={changeHandler}
            />
            <div className="sheet-subscript">{modifier}</div>
            <div style={{textAlign: "left"}} className="sheet-subscript">{name}</div>
        </div>
    );
}