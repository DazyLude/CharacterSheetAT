import { TextInput, NumberInput, Table, UseEffectButton, Checkbox, ControlledSpoiler, TextFieldInput } from "../CommonFormElements";
import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";
import { changeData } from "../../Utils";

export default function Inventory({characterData}) {
    const stats = characterData.stats ?? {};
    const str = stats.str ?? 0;
    const data = characterData.globals.inventory ?? {data: {}};
    const inventoryDispatcher = (args) => {
        changeData({value_type: "global", id: "inventory", ...args}, "character_data")
    };

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
            data={{count: data.count ?? 0, dataSet: data.data}}
            itemElement={InventoryItem}
            defaultItemObject={defaultItem}
            dispatcher={inventoryDispatcher}
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

function InventoryItem({entry, editItem, removeItem, spoilerStateHandler, isOpen}) {
    const {isEditingElements} = useContext(EditorContext);
    const setWeight = (value) => {editItem({placement: [entry.placement[0], value]})};
    const incrementColumn = () => {editItem({placement: [entry.placement[0] + 1, entry.placement[1]]})};
    const decrementColumn = () => {editItem({placement: [entry.placement[0] - 1, entry.placement[1]]})};
    const hasLongDesc = entry.hasLongDesc ?? false;



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
                        onChange={value => setWeight(value)}
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
                <div>
                    <Checkbox
                        style={{width: "99%"}}
                        isChecked={hasLongDesc}
                        changeHandler={(value) => {editItem({hasLongDesc: value})}}
                    />
                </div>
                <UseEffectButton
                    style={{height: "25px", padding: "0px 0px 3px", gridColumn: "4/-1"}}
                    title={"del"}
                    action={() => {removeItem()}}
                />
            </>
        );
    } // else:
    return(
        <>
            <div>
                <ItemDescription spoilerStateHandler={spoilerStateHandler} isOpen={isOpen} longDescription={entry.hasLongDesc} style={{height: "25px", width: "98%"}} text={entry.name} onChange={(value) => {editItem({name: value})}} />
            </div>
            <NumberInput style={{height: "25px"}} value={entry.qty} onChange={(value) => {editItem({qty: value})}} />
            <div>{/* empty block */}</div>
            <span style={{textAlign: "right"}}>
                <NumberInput style={{height: "25px"}} value={entry.wght} onChange={(value) => {editItem({wght: value})}} />
            </span>
            <span className={"sheet-subscript"} style={{alignSelf: "center"}} > &nbsp;lb</span>
        </>
    );
}

function ItemDescription({longDescription, text, onChange, spoilerStateHandler, isOpen, style}) {
    if (longDescription) {
        return(
            <ControlledSpoiler
                isOpen={isOpen}
                stateHandler={spoilerStateHandler}
                preview={<TextInput style={{height: "30px", width: "69%", ...style}} value={text} onChange={onChange}/>}
            >
                <TextFieldInput
                    size={{
                        height: "100px",
                        width: "100%",
                    }}
                    value={text}
                    onChange={onChange}
                />
            </ControlledSpoiler>
        );
    }
    else return(
        <TextInput
            style={{width: "90%", height: "30px", ...style}}
            value={text}
            onChange={onChange}
        />
    );
};

function InventoryHead() {
    const {isEditingElements} = useContext(EditorContext);
    return(
        <>
            {isEditingElements ?
                <>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <span>Name</span>
                        <span>Weight</span>
                    </div>
                    <div>{/* empty block */}</div>
                    <div>desc</div>
                    <div>{/* empty block */}</div>
                    <div>rem</div>
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