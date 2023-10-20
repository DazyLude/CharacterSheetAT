import { TextInput, NumberInput, Table, UseEffectButton } from "../CommonFormElements";
import { useContext } from "react";
import { AppContext } from "../Systems/appContext";

export default function Inventory({characterData, characterDispatch, id}) {
    const stats = characterData.stats ?? {};
    const str = stats.str ?? 0;
    const data = characterData.elements[id] ?? {};
    const dispatcher = (args) => {characterDispatch({id: id, ...args})}; // operation type is defined later

    const carriedWeight = Object.values(data.data).reduce(
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
        gridAutoRows: "25px",
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
            data={{count: data.count, dataSet: data.data}}
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
    const setPriority = (value) => {editItem({placement: [entry.placement[0], value]})};
    const incrementColumn = () => {editItem({placement: [entry.placement[0] + 1, entry.placement[1]]})};
    const decrementColumn = () => {editItem({placement: [entry.placement[0] - 1, entry.placement[1]]})};
    if (isEditingElements) {
        return (
            <>
                <div style={{gridColumn: "1/3", width: "100%", display: "flex", justifyContent: "space-around"}}>
                    <TextInput
                        style={{height: "25px", width: "60%"}}
                        value={entry.name}
                        onChange={(value) => {editItem({name: value})}}
                    />
                    <NumberInput
                        style={{
                            width: "22%",
                            textAlign: "center",
                        }}
                        value={entry.placement[1]}
                        onChange={value => setPriority(value)}
                    />
                    <UseEffectButton
                        style={{
                            height: "25px", padding: "0px 0px 3px", width: "7%"
                        }}
                        title={"<"}
                        action={() => {decrementColumn()}}
                    />
                    <UseEffectButton
                        style={{
                            height: "25px", padding: "0px 0px 3px", width: "7%"
                        }}
                        title={">"}
                        action={() => {incrementColumn()}}
                    />
                </div>
                <UseEffectButton
                    style={{height: "25px", padding: "0px 0px 3px", gridColumn: "3/-1"}}
                    title={"del"}
                    action={() => {removeItem()}}
                />
            </>
        );
    } // else:
    return(
        <>
            <TextInput style={{height: "25px", width: "98%"}} value={entry.name} onChange={(value) => {editItem({name: value})}} />
            <NumberInput style={{height: "25px"}} value={entry.qty} onChange={(value) => {editItem({qty: value})}} />
            <div>{/* empty block */}</div>
            <span style={{textAlign: "right"}}>
                <NumberInput style={{height: "25px"}} value={entry.wght} onChange={(value) => {editItem({wght: value})}} />
            </span>
            <span className={"sheet-subscript"} style={{alignSelf: "center"}} > &nbsp;lb</span>
        </>
    );
}

function InventoryHead() {
    const {isEditingElements} = useContext(AppContext);
    return(
        <>
            {isEditingElements ?
                <>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <span>Name</span>
                        <span>Priority</span>
                    </div>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                    <div>{/* empty block */}</div>
                </>
                :
                <>
                    <div>Name</div>
                    <div>qty</div>
                    <div>{/* empty block */}</div>
                    <div>wght</div>
                    <div>{/* empty block */}</div>
                </>
            }
        </>
    );
}