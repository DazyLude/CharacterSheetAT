import UseEffectButton from "./useEffectButton";
import TextInput from "./CommonFormElements/textInput";
import NumberInput from "./CommonFormElements/numberInput";
import { useContext } from "react";
import { AppContext } from "./appContext";
import Table from "./CommonFormElements/table";

export default function Inventory({characterData, characterDispatch, id}) {
    const str = characterData.primarySkills.str;
    const data = characterData.gridElements[id];
    const dispatcher = (args) => {characterDispatch({id: id, ...args})}; // operation type is defined later

    const {isEditingElements} = useContext(AppContext);

    const carriedWeight = Object.values(data.dataSet).reduce(
        (accumulator, entry) => {return accumulator += entry.wght * entry.qty},
        0
    );

    const defaultItem = {
        name: "",
        wght: 0,
        qty: 0
    }

    const Title =
    <>
        <span className="sheet-subscript">
            Carried: {carriedWeight} lb
        </span>
        <span className="sheet-subscript">
            Encumbered: {str * 15} lb
        </span>
    </>;

    const columnStyle = {
        display: 'grid',
        gridTemplateColumns: '16fr 3fr 2fr 1fr 5px',
        alignItems: "center",
    }

    return (
        <Table
            title={<Title />}
            head={<InventoryHead />}
            columnStyle={columnStyle}
            columns={2}
            data={{count: data.count, dataSet: data.dataSet}}
            itemElement={InventoryItem}
            defaultItemObject={defaultItem}
            dispatcher={dispatcher}
        />
    )
}

function InventoryItem({entry, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    return(
        <div className="form-subscript" style={{display: 'grid', gridTemplateColumns: '16fr 3fr 2fr 1fr 5px', alignItems: "center"}}>
            <TextInput style={{width: "99%"}} value={entry.name} onChange={(value) => {editItem({name: value, qty: entry.qty, wght: entry.wght})}} />
            {isEditingElements ?
                <>
                    <div style={{background: "red", gridColumn: "-5/-4", width: "100%"}}>move</div>
                    <UseEffectButton style={{height: "19px", padding: "0px 0px 3px", gridColumn: "-4/-1"}} title={"del"} action={() => {removeItem()}} />
                </>
                :
                <>
                    <NumberInput value={entry.qty} onChange={(value) => {editItem({name: entry.name, qty: value, wght: entry.wght})}} />
                    <span style={{textAlign: "right"}}>
                        <NumberInput value={entry.wght} onChange={(value) => {editItem({name: entry.name, qty: entry.qty, wght: value})}} />
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