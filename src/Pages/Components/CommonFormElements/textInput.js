export default function TextInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const readOnly = props.readOnly ?? true;

    return(
        <>
            {readOnly ? (<div>{value}</div>) : (
                <input
                    type="text"
                    value={value}
                    onChange={event => {onChange(event.target.value)}}
                />
            )}
        </>
    );
}