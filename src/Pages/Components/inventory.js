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

    const carriedWeight = Object.values(data.dataSet).reduce(
        (accumulator, entry) => {return accumulator += entry.wght * entry.qty},
        0
    );

    const defaultItem = {
        name: "",
        wght: 0,
        qty: 0
    }

    const columnStyle = {
        display: 'grid',
        gridTemplateColumns: '16fr 3fr 2fr 1fr 25px',
        width: "93%",
        rowGap: "3px",
        alignItems: "center",
        textAlign: "left",
    }

    return (
        <Table
            Head={InventoryHead}
            columnStyle={{...columnStyle}}
            columns={2}
            data={{count: data.count, dataSet: data.dataSet}}
            itemElement={InventoryItem}
            defaultItemObject={defaultItem}
            dispatcher={dispatcher}
        >
            <Title carriedWeight={carriedWeight} str={str}/>
        </Table>
    );
}

function Title({carriedWeight, str}) {
    return (
        <>
            <span className="sheet-subscript">
                Carried: {carriedWeight} lb
            </span>
            <span className="sheet-subscript">
                Encumbered: {str * 15} lb
            </span>
        </>
    );
}

function InventoryItem({entry, editItem, removeItem}) {
    const {isEditingElements} = useContext(AppContext);
    return(
        <>
            <TextInput style={{height: "25px", width: "99%"}} value={entry.name} onChange={(value) => {editItem({name: value, qty: entry.qty, wght: entry.wght})}} />
            {isEditingElements ?
                <>
                    <div style={{background: "red", gridColumn: "-5/-4", width: "100%"}}>move</div>
                    <UseEffectButton style={{height: "25px", padding: "0px 0px 3px", gridColumn: "-4/-1"}} title={"del"} action={() => {removeItem()}} />
                </>
                :
                <>
                    <NumberInput style={{height: "25px"}} value={entry.qty} onChange={(value) => {editItem({name: entry.name, qty: value, wght: entry.wght})}} />
                    <div>{/* empty block */}</div>
                    <span style={{textAlign: "right"}}>
                        <NumberInput style={{height: "25px"}} value={entry.wght} onChange={(value) => {editItem({name: entry.name, qty: entry.qty, wght: value})}} />
                    </span>
                    <span className={"sheet-subscript"} style={{alignSelf: "center"}} > &nbsp;lb</span>
                </>
            }
        </>
    );
}

function InventoryHead() {
    const {isEditingElements} = useContext(AppContext);
    return(
        <>
            <div>Name</div>
            {isEditingElements ?
                <>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                </>
                :
                <>
                    <div>qty</div>
                    <div>{/* empty block */}</div>
                    <div>wght</div>
                    <div>{/* empty block */}</div>
                </>
            }
        </>
    );
}