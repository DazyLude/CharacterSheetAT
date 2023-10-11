import { TextInput } from "../CommonFormElements";

export default function GeneralInfo({characterDispatch, characterData}) {
    const {characterName, characterClass, characterLevel, characterBackground, characterRace} = characterData;
    const changeHandler = (merge) => characterDispatch({
        type: "change-text-field",
        mergeObject: merge,
    });

    return (
        <div
            id="general-information"
            style={{
                "paddingTop": "2px",
                "display": "grid",
                "gridTemplateColumns": "2fr 1fr 1fr",
                "gridTemplateRows": "1fr 1fr",
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
                        value={characterName}
                        onChange={(newValue) => changeHandler({"characterName": newValue})}
                    />
                </div>
                <div className="sheet-subscript">character name</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={characterClass}
                        onChange={(newValue) => changeHandler({"characterClass": newValue})}
                    />
                </div>
                <div className="sheet-subscript">class</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={characterLevel}
                        onChange={(newValue) => changeHandler({"characterLevel": newValue})}
                    />
                </div>
                <div className="sheet-subscript">level</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={characterBackground}
                        onChange={(newValue) => changeHandler({"characterBackground": newValue})}
                    />
                </div>
                <div className="sheet-subscript">background</div>
            </div>
            <div>
                <div className="form-text">
                    <TextInput
                        value={characterRace}
                        onChange={(newValue) => changeHandler({"characterRace": newValue})}
                    />
                </div>
                <div className="sheet-subscript">race</div>
            </div>
        </div>
    );
}