import { useContext } from "react";
import { AppContext } from "../Systems/appContext";

export default function DeathSavesTracker({characterData, characterDispatch}) {
    const successes = characterData.deathSavingThrows.successes;
    const failures = characterData.deathSavingThrows.failures;
    const changeHandler = (merge) => {
        characterDispatch({
            type: "change-text-field",
            mergeObject: merge,
            fieldName: "deathSavingThrows",
        });
    };
    return (
        <div style={{
            "alignItems": "center",
            "height": "100%",
            "display": "grid",
            "gridAutoRows": "1fr",
        }}>
            <div className="sheet-title">death saves</div>
            <RadioRow
                title={"successes"}
                count={successes}
                changeHandler={(value) => {changeHandler({"successes": value})}}
            />
            <RadioRow
                title={"failures"}
                count={failures}
                changeHandler={(value) => {changeHandler({"failures": value})}}
            />
        </div>
    );
}

function RadioRow(props) {
    const context = useContext(AppContext);
    const readOnly = context.readOnly;

    const clickHandler = () => {
        if (readOnly) {
            return;
        }
        if (props.count === 3) {
            props.changeHandler(0);
        } else {
            props.changeHandler(props.count + 1);
        }
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1fr",
                width: "100%",
                textAlign: "right",
            }}
            onClick={() => {clickHandler()}}
        >
            <span className="sheet-text" style={{paddingTop: "5px"}}>{props.title}</span>
            <input type="radio" tabIndex="-1" checked={props.count >= 1} readOnly/>
            <input type="radio" tabIndex="-1" checked={props.count >= 2} readOnly/>
            <input type="radio" tabIndex="-1" checked={props.count >= 3} readOnly/>
        </div>
    );
}