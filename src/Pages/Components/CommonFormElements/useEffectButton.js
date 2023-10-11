import { useState, useEffect } from "react";

export default function UseEffectButton({title, action, style}) {
    const [activationSwitch, setActivationSwitch] = useState(0);

    useEffect(() => {
        if (activationSwitch === 0) {
            return;
        }
        return action(); // eslint-disable-next-line
    }, [activationSwitch])

    return (
        <button style={{...style}} onClick = {(e) => {e.preventDefault(); setActivationSwitch(activationSwitch + 1)}}>
            {title}
        </button>
    );
}