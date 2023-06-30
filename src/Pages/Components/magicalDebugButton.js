import { useState, useEffect } from "react";

export default function MagicalDebugButton({additive, action}) {
    const [activationSwitch, setActivationSwitch] = useState(0);
    useEffect(() => {
        if (activationSwitch === 0) {
            return;
        }
        action();
        console.log(`ran magical debug button ${additive} button for ${activationSwitch} time`); // eslint-disable-next-line
    }, [activationSwitch])

    return (
        <button style={{position: "relative", zIndex:"10", height: "88%"}} onClick = {() => {setActivationSwitch(activationSwitch + 1)}}>
            {"magical debug button" + additive}
        </button>
    );
}