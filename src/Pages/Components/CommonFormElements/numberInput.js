export default function NumberInput(props) {
    const value = props.value ?? "";
    const onChange = props.onChange ?? ((e) => {});
    const readOnly = props.readOnly ?? true;

    return(
        <>
            {readOnly ? (<div>{value}</div>) : (
                <input
                    type="number"
                    style={{
                        paddingLeft: "18px",
                        width: "80%"
                    }}
                    value={value}
                    onChange={event => {
                        onChange(parseInt(event.target.value));
                    }}
                />
            )}
        </>
    );
}