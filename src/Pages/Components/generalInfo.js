import TextInput from "./CommonFormElements/textInput";

export default function GeneralInfo(props) {
    return (
        <div
            id="general-information"
            style={{
                "paddingLeft": "15%",
                "paddingTop": "2px",
                "height": "100%",
                "display": "grid",
                "gridTemplateColumns": "1fr 1fr 1fr",
                "gridTemplateRows": "1fr 1fr",
                "background": "#eeeeee",
                "placeItems": "start",
            }}
        >
            <div
                style={{
                    "gridRow": "1/-1",
                    "alignSelf": "center",
                }}
            >
                <div className="form-big">
                    <TextInput
                        value={props.characterName}
                        onChange={(newValue) => props.changeHandler({"characterName": newValue})}
                    />
                </div>
                <div className="sheet-subscript">character name</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={props.characterClass}
                        onChange={(newValue) => props.changeHandler({"characterClass": newValue})}
                    />
                </div>
                <div className="sheet-subscript">class</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={props.characterLevel}
                        onChange={(newValue) => props.changeHandler({"characterLevel": newValue})}
                    />
                </div>
                <div className="sheet-subscript">level</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={props.characterBackground}
                        onChange={(newValue) => props.changeHandler({"characterBackground": newValue})}
                    />
                </div>
                <div className="sheet-subscript">background</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={props.characterRace}
                        onChange={(newValue) => props.changeHandler({"characterRace": newValue})}
                    />
                </div>
                <div className="sheet-subscript">race</div>
            </div>
        </div>
    );
}