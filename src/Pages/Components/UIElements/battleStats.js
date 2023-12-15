import { useCallback, useContext, useEffect, useState } from "react";
import { TextInput, Checkbox } from "../CommonFormElements";
import { editVariable } from "../../Utils";
import { invoke } from "@tauri-apps/api";
import { EditorContext } from "../Systems/appContext";
import { changeData } from "../../Utils";

export default function BattleStats({ characterData, characterDispatch, id }) {
    const [armorClass, setArmorClass] = useState(10);
    const [initiative, setInitiative] = useState(0);
    const {isEditingElements} = useContext(EditorContext);

    const useCustomArmorClass = characterData.elements[id]?.customArmorClass ?? false;
    const useCustomInitiative = characterData.elements[id]?.customInitiative ?? false;

    const setDefaultArmor = useCallback(
        () => {
            editVariable({ name: "armorClass", newValue: "={var:shieldBonus}+{var:armorBonus}" });
            editVariable({ name: "shieldBonus", newValue: 0 });
            editVariable({ name: "armorBonus", newValue: "=10+{stat_mod:dex}" });
        },
        []
    );
    const setDefaultInitiave = useCallback(
        () => {
            editVariable({ name: "initiative", newValue: "={stat_mod:dex}" })
        },
        []
    )
    useEffect( // requests data
        () => {
            const onLoad = () => {
                if (!useCustomArmorClass) {
                    invoke("request_data", { requestedData: "variable", requestedDataArgument: "armorClass" })
                        .then((e) => setArmorClass(e.data))
                        .catch((e) => { setDefaultArmor(); console.log(e); });
                } else {
                    setArmorClass(characterData.globals.armorClass ?? 10)
                }
                if (!useCustomInitiative) {
                    invoke("request_data", { requestedData: "variable", requestedDataArgument: "initiative" })
                        .then((e) => setInitiative(e.data))
                        .catch((e) => { setDefaultInitiave(); console.log(e); });
                } else {
                    setInitiative(characterData.globals.initiative ?? 0)
                }
            }

            onLoad()
        },
        [setDefaultArmor, setDefaultInitiave, useCustomArmorClass, useCustomInitiative, characterData]
    )

    initiative ??= 0;
    const changeHandler = (name, value) => {
        characterDispatch({
            type: "global",
            name,
            value,
        });
    };

    const elementHandler = (name, value) => {
        changeData(
            {value_type: "element", id, value_name: name, new_value: value},
            "character_data"
        );
    };

    if (isEditingElements) {
        return (
            <div style={{
                "height": "100%",
                "display": "grid",
                "alignItems": "center",
                "gridTemplateColumns": "1fr 1fr"
            }}>
                <div>
                    <div className="sheet-title">use custom</div>
                    <Checkbox value={useCustomInitiative} onChange={ (value) => elementHandler("customInitiative", value) } />
                    <div className="sheet-title">initiative</div>
                </div>
                <div>
                    <div className="sheet-title">use custom</div>
                    <Checkbox value={useCustomArmorClass} onChange={ (value) => elementHandler("customArmorClass", value) } />
                    <div className="sheet-title">armor class</div>
                </div>
            </div>
        );
    } else {
        return (
            <div style={{
                "height": "100%",
                "display": "grid",
                "alignItems": "center",
                "gridTemplateColumns": "1fr 1fr"
            }}>
                <div>
                    <div className="sheet-title">initiative</div>
                    <div className="form-big">
                        {useCustomInitiative
                            ? (<TextInput value={initiative} onChange={(value) => { changeHandler("initiative", value) }} />)
                            : (initiative >= 0 ? "+" : "") + initiative
                        }
                    </div>
                </div>
                <div>
                    <div className="sheet-title">armor</div>
                    <div className="form-big">
                        {useCustomArmorClass
                            ? (<TextInput value={armorClass} onChange={(value) => { changeHandler("armorClass", value) }} />)
                            : armorClass
                        }
                    </div>
                    <div className="sheet-title">class</div>
                </div>
            </div>
        );
    }
}
