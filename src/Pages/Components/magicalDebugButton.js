export default function MagicalDebugButton(props) {
    return (
        <button style={{position: "relative", zIndex:"10", height: "88%"}} onClick = {() => {props.action()}}>
            {"magical debug button" + props.additive}
        </button>
    );
}