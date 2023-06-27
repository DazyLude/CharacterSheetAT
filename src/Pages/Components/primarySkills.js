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
                readOnly={props.readOnly}
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
                "display": "flex",
                "flexDirection": "column",
                "textAlign": "center",
                "justifyContent": "space-around",
                ...props.placement
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
                "background": (props.even ? "#eeeeee" : "#f8f8f8"),
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
                    readOnly={props.readOnly}
                />
            </div>
            <div
                className="form-text"
                style={{

            }}>
                {getStatMod(props.value)}
            </div>
        </div>
    );
}