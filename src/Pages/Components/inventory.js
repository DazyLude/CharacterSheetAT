import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";

export default function Inventory({skills, data, dispatcher}) {

    const entriesCount = data.count;
    const inventoryContents = data.dataSet;
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
            <div>
                <UseEffectButton style={{height: "22px", width: "30px", padding: "0px 0px 3px"}} title="+" action={() => {incrementCount(); addItem();}}/>
                Carried: {carriedWeight} lb
                Encumbered: {skills.str * 15} lb
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
    return(
        <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: 'auto 8fr auto 2fr auto 2fr 1fr 1fr', alignItems: "center"}}>
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <TextInput style={{width: "100%"}} value={entry.name} onChange={(value) => {editItem(id, {name: value, qty: entry.qty, wght: entry.wght})}} />
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <NumberInput value={entry.qty} onChange={(value) => {editItem(id, {name: entry.name, qty: value, wght: entry.wght})}} />
            <div style={{border: "solid 1px #ccc", height: "100%"}}> </div>
            <span style={{textAlign: "right"}}>
                <NumberInput value={entry.wght} onChange={(value) => {editItem(id, {name: entry.name, qty: entry.qty, wght: value})}} />
            </span>
            <span className={"sheet-subscript"} style={{textAlign: "left"}}>&nbsp;lb</span>
            <UseEffectButton style={{height: "22px", padding: "0px 0px 3px"}} title={"-"} action={() => {removeItem(id)}} />
        </div>
    );
}

function InventoryHead() {
    return(
        <div className="sheet-subscript" style={{display: 'grid', gridTemplateColumns: '1fr 8fr 2fr 3fr 1fr', alignItems: "center", textAlign: "left", borderBottomStyle: "solid"}}>
            <div></div>
            <div>Name</div>
            <div>qty</div>
            <div>weight</div>
        </div>
    );
}