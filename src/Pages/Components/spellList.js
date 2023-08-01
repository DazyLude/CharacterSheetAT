import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";
import { useContext } from "react";
import { AppContext } from "./appContext";
import { getStatModNumeric, getStatMod } from "../Utils";
import TextFieldInput from "./CommonFormElements/textFieldInput";
import { Checkbox } from "./CommonFormElements/checkbox";

export default function SpellList({data, skills, proficiencyModifier, dispatcher}) {
    const entriesCount = data.count;
    const spellListContents = data.dataSet;
    const {isEditingElements} = useContext(AppContext);

    const spellCastingAbility = data.spellCastingAbility ?? "cha";
    const spellSavingThrow = getStatModNumeric(skills[spellCastingAbility], 8 + proficiencyModifier);
    const spellAttackBonus = getStatMod(skills[spellCastingAbility], proficiencyModifier + data.weaponBonus);

    const displayEntries = Object.entries(spellListContents).map(([id, entry]) => {
        entry ??= {};
        return (
            <SpellListItem key={id} entry={entry} id={id} editItem={(id, val) => {editItem(id, val)}} removeItem={(args) => {removeItem(args)}} />
        );
    });

    const incrementCount = () => {
        dispatcher({type: "change-grid-element", merge: {count: entriesCount + 1}});
    }

    const addItem = () => {
        const newItem = {
            name: "",
            wght: 0,
            qty: 0,
        }
        dispatcher({type: "add-set-item", itemId: entriesCount + 1, item: newItem});
    }

    const removeItem = (removedItemId) => {
        dispatcher({
            type: "remove-set-item",
            itemId: removedItemId,
        })
    }
    const editItem = (replacedItemId, replacement) => {
        dispatcher({
            type: "replace-set-item",
            itemId: replacedItemId,
            replacement: replacement,
        })
    }

    const changeSpellCastingAbility = (val) => {
        dispatcher({type: "change-grid-element", merge: {spellCastingAbility: val}});
    }

    return (
        <>
            <div style={{display: "flex", justifyContent: "space-around"}}>

                { isEditingElements ?
                <>
                    <select value={spellCastingAbility} onChange={(e) => changeSpellCastingAbility(e.target.value)}>
                        <option value="int">intelligence</option>
                        <option value="wis">wisdom</option>
                        <option value="cha">charisma</option>
                    </select>
                    <UseEffectButton style={{height: "18px", width: "300px", padding: "0px 5px 2px"}} title="add element" action={() => {incrementCount(); addItem();}}/>
                </>
                :
                <>
                    <span className="sheet-subscript">
                        Spellcasting ability: {spellCastingAbility}
                    </span>
                    <span className="sheet-subscript">
                        Spell saving throw: {spellSavingThrow}
                    </span>
                    <span className="sheet-subscript">
                        Spell attack bonus: {spellAttackBonus}
                    </span>
                </>
                }
            </div>
            <div style={{height: "90%"}}>
                <div style={{position: "relative", zIndex: "1"}}>
                    <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: 'repeat(10, auto)', alignItems: "center"}}>
                        <SpellListHead />
                        {displayEntries}
                    </div>
                </div>
            </div>
        </>
    );
}

function SpellListHead() {
    return (
        <>
            <span>Prep</span>
            <span>Spell Name</span>
            <span>Source</span>
            <span>Save/Atk</span>
            <span>Time</span>
            <span>Range</span>
            <span>Comp</span>
            <span>Duration</span>
            <span>Ref</span>
            <span>Notes</span>
        </>
    );
}

function SpellListItem({entry, id, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    const longDescription = entry.isLong;
    const isPrepared = entry.isPrepared;
    return(
        <>
            <Checkbox isChecked={isPrepared} changeHandler={(value) => {editItem(id, {...entry, isPrepared: value})}} />
            <TextInput style={{width: "99%"}} value={entry.name} onChange={(value) => {editItem(id, {...entry, name: value})}} />

            <NumberInput value={entry.qty} onChange={(value) => {editItem(id, {name: entry.name, qty: value, wght: entry.wght})}} />

            <span style={{textAlign: "right"}}>
                <NumberInput value={entry.wght} onChange={(value) => {editItem(id, {name: entry.name, qty: entry.qty, wght: value})}} />
            </span>
            <span className={"sheet-subscript"} style={{textAlign: "left"}}>&nbsp;lb</span>
            {isEditingElements ?
                <UseEffectButton style={{height: "19px", padding: "0px 0px 3px"}} title={"-"} action={() => {removeItem(id)}} />
                :
                null
            }
        </>
    );
}

function SpoileredDescription({text, changeHandler, isOpen}) {
    return (
        <TextFieldInput
            size={{
                display: (isOpen ? "block" : "none"),
                position: "relative",
            }}
            value={text}
            onChange={changeHandler}
        />
    );
}