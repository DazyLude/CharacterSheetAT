import { getStatMod } from "../Utils";

export default function PrimarySkills(props) {
    return (
        <div
            id="primary-skills"
            style={{
                "display": "flex",
                "flexDirection": "column",
                "textAlign": "center",
                ...props.placement
            }}
        >
            <StatSquare even={false} value={props.skills.str} title={"strength"}/>
            <StatSquare even={true} value={props.skills.dex} title={"dexterity"}/>
            <StatSquare even={false} value={props.skills.con} title={"constitution"}/>
            <StatSquare even={true} value={props.skills.int} title={"intelligence"}/>
            <StatSquare even={false} value={props.skills.wis} title={"wisdom"}/>
            <StatSquare even={true} value={props.skills.cha} title={"charisma"}/>
        </div>
    );
}

function StatSquare(props) {
    let title = props.title ?? "dolorsitamet";
    return(
        <div
            style={{
                "background": (props.even ? "#eeeeee" : "#f8f8f8"),
            }}
        >
            <span
                className="sheet-title">
                {title}
            </span>
            <div
                className="form-big"
                style={{

            }}>
                {props.value}
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