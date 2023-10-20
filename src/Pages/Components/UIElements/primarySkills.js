import { getStatMod } from "../../Utils";
import { NumberInput } from "../CommonFormElements";

export default function PrimarySkills({characterDispatch, characterData}) {
    const primarySkills = characterData.globals.stats ?? {};
    const changeHandler = (merge) => {
        characterDispatch({
            type: "global-merge",
            name: "stats",
            value: merge,
        })
    };

    const skills = {
        "str": "strength",
        "dex": "dexterity",
        "con": "constitution",
        "int": "intelligence",
        "wis": "wisdom",
        "cha": "charisma",
    }

    const statList = Object.entries(skills).map(
        ([key, val], num) => {
            return <StatSquare
                even={(num % 2) === 0}
                key={key}
                value={primarySkills[key] ?? 0}
                title={val}
                onChange={(newValue) => {
                    const mergeObject = {};
                    mergeObject[key] = newValue;
                    changeHandler(mergeObject);
                }}
            />
        }
    )

    return (
        <div
            id="primary-skills"
            style={{
                "height": "100%",
                "display": "flex",
                "flexDirection": "column",
                "textAlign": "center",
                "justifyContent": "space-between",
            }}
        >
            {statList}
        </div>
    );
}

function StatSquare(props) {
    let title = props.title ?? "dolorsitamet";
    return(
        <div
            style={{
                "background": "#e0e0e0",
                "padding": "5px 0px",
            }}
        >
            <span
                className="sheet-title">
                {title}
            </span>
            <div className="form-big">
                <NumberInput
                    value={props.value ?? 0}
                    onChange={(val) => props.onChange(val)}
                />
            </div>
            <div className="sheet-large" >
                {getStatMod(props.value)}
            </div>
        </div>
    );
}