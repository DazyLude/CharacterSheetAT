import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";
import { useContext } from "react";
import { AppContext } from "./appContext";

export default function SpellList({data, skills, dispatcher}) {
    const entriesCount = data.count;
    const spellListContents = data.dataSet;
    const {isEditingElements} = useContext(AppContext);

    const carriedWeight = Object.values(spellListContents).reduce(
        (accumulator, entry) => {return accumulator += entry.wght * entry.qty},
        0
    );

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

    return (
        <>
            <div style={{display: "flex", justifyContent: "space-around"}}>
                <span className="sheet-subscript">
                    Spellcasting ability: {carriedWeight} lb
                </span>
                <span className="sheet-subscript">
                    Encumbered: {skills.str * 15} lb
                </span>
                { isEditingElements ?
                <UseEffectButton style={{height: "18px", width: "300px", padding: "0px 5px 2px"}} title="add element" action={() => {incrementCount(); addItem();}}/>
                :
                null
                }
            </div>
            <div style={{height: "90%"}}>
                <div style={{position: "relative", zIndex: "1"}}>
                    <div style={{display: "flex", direction: "column"}}>
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
        <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: 'auto 8fr auto 2fr auto 2fr 1fr 1fr', alignItems: "center"}}>
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
        </div>
    );
}

function SpellListItem({entry, id, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    return(
        <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: 'auto 8fr auto 2fr auto 2fr 1fr 1fr', alignItems: "center"}}>
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <TextInput style={{width: "99%"}} value={entry.name} onChange={(value) => {editItem(id, {name: value, qty: entry.qty, wght: entry.wght})}} />
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <NumberInput value={entry.qty} onChange={(value) => {editItem(id, {name: entry.name, qty: value, wght: entry.wght})}} />
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <span style={{textAlign: "right"}}>
                <NumberInput value={entry.wght} onChange={(value) => {editItem(id, {name: entry.name, qty: entry.qty, wght: value})}} />
            </span>
            <span className={"sheet-subscript"} style={{textAlign: "left"}}>&nbsp;lb</span>
            {isEditingElements ?
                <UseEffectButton style={{height: "19px", padding: "0px 0px 3px"}} title={"-"} action={() => {removeItem(id)}} />
                :
                null
            }
        </div>
    );
}