export default function MagicalDebugButton(props) {
    return (
        <button
            style = {{
                "zIndex": "9999",
                ...props.placement,
            }}
            onClick = {() => {props.action()}}
        >
            {"magical debug button" + props.additive}
        </button>
    );
}