import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";
import { useContext } from "react";
import { AppContext } from "./appContext";

export default function Inventory({characterData, characterDispatch, id}) {
    const str = characterData.primarySkills.str;
    const data = characterData.gridElements[id];
    const dispatcher = (args) => {characterDispatch({id: id, ...args})}; // operation type is defined later

    const entriesCount = data.count;
    const inventoryContents = data.dataSet;
    const {isEditingElements} = useContext(AppContext);

    const carriedWeight = Object.values(inventoryContents).reduce(
        (accumulator, entry) => {return accumulator += entry.wght * entry.qty},
        0
    );
    const displayEntries = Object.entries(inventoryContents).map(([id, entry]) => {
        entry ??= {};
        return (
            <InventoryItem key={id} entry={entry} id={id} editItem={(id, val) => {editItem(id, val)}} removeItem={(args) => {removeItem(args)}} />
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
                    Carried: {carriedWeight} lb
                </span>
                <span className="sheet-subscript">
                    Encumbered: {str * 15} lb
                </span>
                { isEditingElements ?
                <UseEffectButton style={{height: "18px", width: "300px", padding: "0px 5px 2px"}} title="add element" action={() => {incrementCount(); addItem();}}/>
                :
                null
                }
            </div>
            <div style={{height: "90%"}}>
                <div style={{position: "relative", zIndex: "1"}}>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px", rowGap: "5px", margin:"20px"}}>
                        <InventoryHead />
                        <InventoryHead />
                        {displayEntries}
                    </div>
                </div>
            </div>
        </>
    );
}

function InventoryItem({entry, id, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    return(
        <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: '16fr 3fr 2fr 1fr 5px', alignItems: "center"}}>
            <TextInput style={{width: "99%"}} value={entry.name} onChange={(value) => {editItem(id, {name: value, qty: entry.qty, wght: entry.wght})}} />
            {isEditingElements ?
                <>
                    <div style={{background: "red", gridColumn: "-5/-4", width: "100%"}}>move</div>
                    <UseEffectButton style={{height: "19px", padding: "0px 0px 3px", gridColumn: "-4/-1"}} title={"del"} action={() => {removeItem(id)}} />
                </>
                :
                <>
                    <NumberInput value={entry.qty} onChange={(value) => {editItem(id, {name: entry.name, qty: value, wght: entry.wght})}} />
                    <span style={{textAlign: "right"}}>
                        <NumberInput value={entry.wght} onChange={(value) => {editItem(id, {name: entry.name, qty: entry.qty, wght: value})}} />
                    </span>
                    <span className={"sheet-subscript"} style={{textAlign: "left"}}>&nbsp;lb</span>
                </>
            }
        </div>
    );
}

function InventoryHead() {
    const {isEditingElements} = useContext(AppContext);
    return(
        <div className="sheet-subscript" style={{display: 'grid', gridTemplateColumns: '10px 22fr 5fr 3fr 10px', alignItems: "center", textAlign: "left", borderBottomStyle: "solid"}}>
            <div>{/* empty block */}</div>
            <div>Name</div>
            {isEditingElements ?
                <></>
                :
                <>
                    <div>qty</div>
                    <div>wght</div>
                </>
            }
        </div>
    );
}