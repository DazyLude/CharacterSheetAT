import TextInput from "./CommonFormElements/textInput";
import TextFieldInput from "./CommonFormElements/textFieldInput";

export default function CustomTextField({titleText, titleChangeHandler, bodyText, bodyChangeHandler}) {
    return (
        <div style={{display: "grid", gridTemplateRows: "25px auto", justifyItems: "center", height: "100%", width: "100%"}}>
            <div className={"form-title"}>
                <TextInput value={titleText ?? "title"} onChange={titleChangeHandler}/>
            </div>
            <TextFieldInput value={bodyText ?? "body text"} onChange={bodyChangeHandler} />
        </div>
    );
}