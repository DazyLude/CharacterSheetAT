import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import { useContext } from "react";
import { useState } from "react";
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
            <SpellListItem key={id} entry={entry} editItem={(val) => {editItem(id, val)}} removeItem={() => {removeItem(id)}} />
        );
    });

    const incrementCount = () => {
        dispatcher({type: "change-grid-element", merge: {count: entriesCount + 1}});
    }

    const addItem = () => {
        const newItem = {
            name: "",
            source: "",
            save_atk: "",
            cast_time: "",
            range: "",
            duration: "",
            text: "",
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
                    <div
                        className="form-subscript"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 170px 60px 80px 80px 80px 60px 90px auto',
                            gridTemplateRows: '30px',
                            rowGap: "3px",
                            alignItems: "center"
                        }}
                    >
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
            <span>Notes</span>
        </>
    );
}

function SpellListItem({entry, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    const longDescription = entry.isLong;
    const isPrepared = entry.isPrepared;

    const description = (isEditingElements, longDescription, entry, editItem, removeItem) => {
        const textHandler = (value) => {editItem({...entry, text: value})};
        const spoilerHandler = (value) => {editItem({...entry, isLong: value})};
        if (isEditingElements) {
            return (
                <span style={{width: "99%"}}>
                    <Checkbox
                        isChecked={longDescription}
                        changeHandler={spoilerHandler}
                    />
                    <button onClick={() => {removeItem()}}> - </button>
                </span>
            );
        }
        else if (longDescription) {
            return(
                <SpoileredDescription
                    text={entry.text}
                    onChange={textHandler}
                />
            );
        }
        else return(
            <TextInput
                style={{width: "99%"}}
                value={entry.text}
                onChange={textHandler}
            />
        );
    };

    return(
        <>
            {/* prepared status */}
            <Checkbox
                style={{width: "99%"}}
                isChecked={isPrepared}
                changeHandler={(value) => {editItem({...entry, isPrepared: value})}}
            />
            {/* name */}
            <TextInput
                style={{width: "99%"}}
                value={entry.name}
                onChange={(value) => {editItem({...entry, name: value})}}
            />
            {/* name */}
            <TextInput
                style={{width: "99%"}}
                value={entry.source}
                onChange={(value) => {editItem({...entry, source: value})}}
            />
            {/* name */}
            { isEditingElements ?
                <select value={entry.save_atk} onChange={(e) => {editItem({...entry, save_atk: e.target.value})}}>
                    <option value="">---</option>
                    <option value="atk">atk</option>
                    <option value="str">str</option>
                    <option value="dex">dex</option>
                    <option value="con">con</option>
                    <option value="int">int</option>
                    <option value="wis">wis</option>
                    <option value="cha">cha</option>
                </select>
                :
                <span>{entry.save_atk}</span>
            }
            {/* cast time */}
            <TextInput
                style={{width: "99%"}}
                value={entry.cast_time}
                onChange={(value) => {editItem({...entry, cast_time: value})}}
            />
            {/* range */}
            <TextInput
                style={{width: "99%"}}
                value={entry.range}
                onChange={(value) => {editItem({...entry, range: value})}}
            />
            {/* spell components */}
            <TextInput
                style={{width: "99%"}}
                value={entry.components}
                onChange={(value) => {editItem({...entry, components: value})}}
            />
            {/* spell duration */}
            <TextInput
                style={{width: "99%"}}
                value={entry.duration}
                onChange={(value) => {editItem({...entry, duration: value})}}
            />
            {/* spell description */}
            {description(isEditingElements, longDescription, entry, editItem, removeItem)}
        </>
    );
}

function SpoileredDescription({text, onChange}) {
    let [isOpen, setIsOpen] = useState(false);
    if (isOpen) {
        return (
            <div style={{height: "30px"}}>
                <div style={{
                    position: "absolute",
                }}>
                    <TextFieldInput
                        size={{
                            height: "100px",
                            width: "100%",
                        }}
                        value={text}
                        onChange={onChange}
                    />
                    <button onClick={() => {setIsOpen(false)}}> hide </button>
                </div>
            </div>
        );
    }
    else {
        return (
            <div style={{height: "30px"}}>
                <TextInput style={{width: "69%"}} value={text} onChange={onChange}/>
                <button style={{padding: "5px 10px", width: "30%"}} onClick={() => {setIsOpen(true)}}> more </button>
            </div>
        );
    }
}