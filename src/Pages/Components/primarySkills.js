import { getStatMod } from "../Utils";
import NumberInput from "./CommonFormElements/numberInput";

export default function PrimarySkills(props) {
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
                value={props.skills[key]}
                title={val}
                onChange={(newValue) => {
                    const mergeObject = {};
                    mergeObject[key] = newValue;
                    props.changeHandler(mergeObject);
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
                    value={props.value}
                    onChange={(val) => props.onChange(val)}
                />
            </div>
            <div
                className="sheet-large"
                style={{

            }}>
                {getStatMod(props.value)}
            </div>
        </div>
    );
}