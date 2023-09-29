import { useContext } from "react";
import { AppContext } from "./appContext";
import { getStatModNumeric, getStatMod } from "../Utils";
import TextFieldInput from "./CommonFormElements/textFieldInput";
import TextInput from "./CommonFormElements/textInput";
import { ControlledSpoiler } from "./CommonFormElements/spoiler";
import Checkbox from "./CommonFormElements/checkbox";
import Table from "./CommonFormElements/table";

export default function SpellList({characterData, characterDispatch, id}) {
    const skills = characterData.primarySkills;
    const proficiencyModifier = characterData.proficiencyModifier;
    const data = characterData.gridElements[id];
    const dispatcher = (args) => {characterDispatch({id: id, ...args})}; // operation type is defined later

    const { isEditingElements } = useContext(AppContext)

    const spellCastingAbility = data.spellCastingAbility ?? "cha";
    const spellSavingThrow = getStatModNumeric(skills[spellCastingAbility], 8 + proficiencyModifier);
    const spellAttackBonus = getStatMod(skills[spellCastingAbility], proficiencyModifier + data.weaponBonus);

    const defaultSpell = {
        isPrepared: false,
        name: "",
        source: "",
        save_atk: "",
        cast_time: "",
        range: "",
        duration: "",
        text: "",
    }

    const changeSpellCastingAbility = (val) => {
        dispatcher({type: "change-grid-element", merge: {spellCastingAbility: val}});
    }

    const Title = () => {
        if (isEditingElements) {
            return (
                    <select style={{padding: "2px 10px"}} value={spellCastingAbility} onChange={(e) => changeSpellCastingAbility(e.target.value)}>
                        <option value="int">intelligence</option>
                        <option value="wis">wisdom</option>
                        <option value="cha">charisma</option>
                    </select>
            );
        }
        else {
            return (
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
            );
        }
    }

    const columnStyle = {
            width: "90%",
            display: 'grid',
            gridTemplateColumns: '40px 170px 60px 80px 80px 80px 60px 90px auto',
            rowGap: "3px",
            alignItems: "center"
    }

    return (
        <Table
            title={<Title />}
            head={<SpellListHead />}
            columnStyle={columnStyle}
            columns={1}
            data={{count: data.count, dataSet: data.dataSet}}
            itemElement={Spell}
            defaultItemObject={defaultSpell}
            dispatcher={dispatcher}
        />
    )
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

function Spell({entry, editItem, removeItem, isOpen, spoilerStateHandler}) {
    const {isEditingElements} = useContext(AppContext);
    const longDescription = entry.isLong;
    const isPrepared = entry.isPrepared;

    const description = (isEditingElements, longDescription, entry, editItem, removeItem) => {
        const textHandler = (value) => {editItem({...entry, text: value})};
        const spoilerHandler = (value) => {editItem({...entry, isLong: value})};
        if (isEditingElements) {
            return (
                <span style={{height: "30px", width: "99%"}}>
                    Long description
                    <Checkbox
                        isChecked={longDescription}
                        changeHandler={spoilerHandler}
                    />
                    <button style={{padding: "5px 10px"}} onClick={removeItem}> - </button>
                </span>
            );
        }
        else if (longDescription) {
            return(
                <ControlledSpoiler
                    isOpen={isOpen}
                    stateHandler={spoilerStateHandler}
                    preview={<TextInput style={{height: "30px", width: "69%"}} value={entry.text} onChange={textHandler}/>}
                >
                    <TextFieldInput
                        size={{
                            height: "100px",
                            width: "100%",
                        }}
                        value={entry.text}
                        onChange={textHandler}
                    />
                </ControlledSpoiler>
            );
        }
        else return(
            <TextInput
                style={{width: "90%", height: "30px"}}
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
                style={{width: "99%", height: "30px"}}
                value={entry.name}
                onChange={(value) => {editItem({...entry, name: value})}}
            />
            {/* source */}
            <TextInput
                style={{width: "99%", height: "30px"}}
                value={entry.source}
                onChange={(value) => {editItem({...entry, source: value})}}
            />
            {/* save/atk info */}
            { isEditingElements ?
                <select style={{padding: "5px 10px"}} value={entry.save_atk} onChange={(e) => {editItem({...entry, save_atk: e.target.value})}}>
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
                style={{width: "99%", height: "30px"}}
                value={entry.cast_time}
                onChange={(value) => {editItem({...entry, cast_time: value})}}
            />
            {/* range */}
            <TextInput
                style={{width: "99%", height: "30px"}}
                value={entry.range}
                onChange={(value) => {editItem({...entry, range: value})}}
            />
            {/* spell components */}
            <TextInput
                style={{width: "99%", height: "30px"}}
                value={entry.components}
                onChange={(value) => {editItem({...entry, components: value})}}
            />
            {/* spell duration */}
            <TextInput
                style={{width: "99%", height: "30px"}}
                value={entry.duration}
                onChange={(value) => {editItem({...entry, duration: value})}}
            />
            {/* spell description */}
            {description(isEditingElements, longDescription, entry, editItem, removeItem)}
        </>
    );
}