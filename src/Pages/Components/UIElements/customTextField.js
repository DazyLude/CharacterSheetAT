import { TextFieldInput, TextInput } from "../CommonFormElements";

export default function CustomTextField({characterData, characterDispatch, id}) {
    const bodyText = characterData.gridElements[id].bodyText;
    const titleText = characterData.gridElements[id].titleText;
    const bodyChangeHandler = (value) => {
        characterDispatch({type: "change-grid-element", merge: {bodyText: value}, id});
    };
    const titleChangeHandler = (value) => {
        characterDispatch({type: "change-grid-element", merge: {titleText: value}, id})
    };
    return (
        <div style={{display: "grid", gridTemplateRows: "25px auto", justifyItems: "center", height: "100%", width: "100%"}}>
            <div className={"form-title"}>
                <TextInput value={titleText ?? "title"} onChange={titleChangeHandler}/>
            </div>
            <TextFieldInput value={bodyText ?? "body text"} onChange={bodyChangeHandler} />
        </div>
    );
}