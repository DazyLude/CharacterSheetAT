import { TextFieldInput, TextInput } from "../CommonFormElements";

export default function CustomTextField({characterData, characterDispatch, id}) {
    const data = characterData.elements[id] ?? {};
    const bodyText = data.bodyText ?? "";
    const titleText = data.titleText ?? "";
    const bodyChangeHandler = (value) => {
        characterDispatch({
            type: "element-merge",
            value: {bodyText: value},
            id
        });
    };
    const titleChangeHandler = (value) => {
        characterDispatch({
            type: "element-merge",
            value: {titleText: value},
            id
        })
    };
    return (
        <div style={{display: "grid", gridTemplateRows: "25px auto", justifyItems: "center", height: "100%", width: "100%"}}>
            <div className={"form-title"}>
                <TextInput value={titleText} onChange={titleChangeHandler}/>
            </div>
            <TextFieldInput value={bodyText} onChange={bodyChangeHandler} />
        </div>
    );
}