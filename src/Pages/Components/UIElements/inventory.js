import { TextInput, NumberInput, Table, UseEffectButton, Checkbox, ControlledSpoiler, TextFieldInput, NumberInputWithPostfix } from "../CommonFormElements";
import { useContext, createContext, useCallback, useState } from "react";
import { EditorContext } from "../Systems/appContext";
import { changeData, editVariable } from "../../Utils";

const InventoryContext = createContext();

export default function Inventory({ characterData }) {
    const stats = characterData.stats ?? {};
    const str = stats.str ?? 0;
    const data = characterData.globals.inventory ?? { data: {} };
    const inventoryDispatcher = (args) => {
        changeData({ value_type: "global", id: "inventory", ...args }, "character_data")
    };

    const carriedWeight = Object.values(data.data).reduce(
        (accumulator, entry) => { return accumulator += entry.wght * entry.qty },
        0
    );

    const defaultItem = {
        name: "",
        wght: 0,
        qty: 0
    }

    const columnStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr) 25px',
        gridAutoRows: "25px",
        width: "93%",
        rowGap: "3px",
        alignItems: "center",
        textAlign: "left",
    }

    let equipItem = useCallback(
        (entry, equipping) => {
            if (entry.itemType == null) {
                return;
            }
            switch (entry.itemType) {
                case "shield":
                    if (equipping) {
                        editVariable({ name: "shieldBonus", newValue: entry.bonus ?? 2 });
                    }
                    else {
                        editVariable({ name: "shieldBonus", newValue: 0 });
                    }
                    break;
                case "armor":
                    if (equipping) {
                        editVariable({ name: "armorBonus", newValue: entry.bonus ?? "=14+{stat_cap:dex}" });
                    }
                    else {
                        editVariable({ name: "armorBonus", newValue: "=10+{stat_mod:dex}" });
                    }
                    break;
                default:
                    return;
            }
        },
        []
    )

    return (
        <InventoryContext.Provider value={{ equipItem, attuneToItem: () => { } }}>
            <Table
                Head={InventoryHead}
                columnStyle={{ ...columnStyle }}
                columns={2}
                data={{ count: data.count ?? 0, dataSet: data.data }}
                itemElement={InventoryItem}
                defaultItemObject={defaultItem}
                dispatcher={inventoryDispatcher}
            >
                <Title carriedWeight={carriedWeight} str={str} />
            </Table>
        </InventoryContext.Provider>
    );
}

function Title({ carriedWeight, str }) {
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

function InventoryItem({ entry, editItem, removeItem, spoilerStateHandler, isOpen }) {
    const { isEditingElements } = useContext(EditorContext);
    const setWeight = (value) => { editItem({ placement: [entry.placement[0], value] }) };
    const incrementColumn = () => { editItem({ placement: [entry.placement[0] + 1, entry.placement[1]] }) };
    const decrementColumn = () => { editItem({ placement: [entry.placement[0] - 1, entry.placement[1]] }) };
    const hasLongDesc = entry.hasLongDesc ?? false;
    const isEquippable = entry.equipment ?? false;
    const equipped = isEquippable && (entry.equipped ?? false);
    const isAttunable = entry.attunement ?? false;
    const attuned = entry.attunement && (entry.attuned ?? false);
    const { equipItem, attuneToItem } = useContext(InventoryContext);
    const [page, setPage] = useState(0);
    const pagesCount = 4;

    const pages = useCallback(
        (page) => {
            const n = ((page % pagesCount) + pagesCount) % pagesCount;
            switch (n) {
                case 0:
                default:
                    return (<>
                        <TextInput
                            style={{ gridColumn: "1/4", height: "25px", width: "100%" }}
                            value={entry.text}
                            onChange={(value) => { editItem({ text: value }) }}
                        />
                        <span style={{ gridColumn: "4/8" }}>long desc</span>
                        <Checkbox
                            style={{ width: "99%", gridColumn: "8/9" }}
                            value={hasLongDesc}
                            onChange={(value) => { editItem({ hasLongDesc: value }) }}
                        />
                        <UseEffectButton
                            style={{ gridColumn: "9/13", height: "25px", padding: "0px", marginLeft: "5px" }}
                            title={"del item"}
                            action={() => { removeItem() }}
                        />
                    </>);
                case 1:
                    return (<>
                        <span style={{ gridColumn: "1/4" }}> weight/column </span>
                        <div style={{ gridColumn: "4/10", width: "100%", display: "flex", justifyContent: "space-around" }}>
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
                                    height: "25px", padding: "0px 0px 3px", width: "30%"
                                }}
                                title={"<"}
                                action={() => { decrementColumn() }}
                            />
                            <UseEffectButton
                                style={{
                                    height: "25px", padding: "0px 0px 3px", width: "30%"
                                }}
                                title={">"}
                                action={() => { incrementColumn() }}
                            />
                        </div>
                    </>);
                case 2:
                    return (<>
                        <span style={{ gridColumn: "1/3" }}> equippable </span>
                        <Checkbox
                            style={{ width: "99%", gridColumn: "3/4" }}
                            value={isEquippable}
                            onChange={(value) => { editItem({ equipment: value }) }}
                        />
                        <span style={{ gridColumn: "6/10" }}> attunable </span>
                        <Checkbox
                            style={{ width: "99%", gridColumn: "10/11" }}
                            value={isAttunable}
                            onChange={(value) => { editItem({ attunement: value }) }}
                        />
                    </>);
                case 3:
                    return (<>
                        <span style={{ gridColumn: "1/2" }}> type </span>
                        <TextInput
                            style={{ width: "99%", gridColumn: "2/6" }}
                            value={entry.itemType ?? ""}
                            onChange={(value) => { editItem({ itemType: value }) }}
                        />
                        <span style={{ gridColumn: "6/9" }}> bonus </span>
                        <TextInput
                            style={{ width: "99%", gridColumn: "9/13" }}
                            value={entry.bonus ?? ""}
                            onChange={(value) => { editItem({ bonus: value }) }}
                        />
                    </>);

            }
        },
        [entry]
    )
    const additionalButtons = (isEquippable ? 1 : 0) + (isAttunable ? 1 : 0);

    const attune = () => {
        editItem({ attuned: !attuned });
        attuneToItem(entry);
    }

    const equip = () => {
        editItem({ equipped: !equipped });
        equipItem(entry, !equipped);
    }

    if (isEditingElements) {
        return (<>
            {pages(page)}
            <div style={{ gridColumn: "13/-1" }}>
                {((page % pagesCount) + pagesCount) % pagesCount + 1}/{pagesCount}
                <UseEffectButton style={{ height: "25px", width: "30%", padding: "0px" }} title={"<"} action={() => { setPage(page - 1) }} />
                <UseEffectButton style={{ height: "25px", width: "30%", padding: "0px" }} title={">"} action={() => { setPage(page + 1) }} />
            </div>
        </>);
    } // else:
    return (
        <>
            <div style={{ gridColumn: "1/" + (13 - additionalButtons * 2) }}>
                <ItemDescription spoilerStateHandler={spoilerStateHandler} isOpen={isOpen} longDescription={entry.hasLongDesc} style={{ height: "25px", width: "98%" }} text={entry.text} onChange={(value) => { editItem({ text: value }) }} />
            </div>
            {isEquippable ?
                <div onClick={equip} style={
                    {
                        gridColumn: (isAttunable ? "9/11" : "11/13"),
                        fontWeight: equipped ? "bold" : "normal"
                    }
                }>
                    eqp
                </div> : null}
            {isAttunable ? <div onClick={attune} style={{ gridColumn: "11/13", fontWeight: attuned ? "bold" : "normal" }}>att</div> : null}
            <NumberInput style={{ gridColumn: "13/15", height: "25px", textAlign: "center" }} value={entry.qty} onChange={(value) => { editItem({ qty: value }) }} />

            <NumberInputWithPostfix postfix={'\xA0' + "lb"} style={{ textAlign: "right", gridColumn: "15/-1", height: "25px" }} value={entry.wght} onChange={(value) => { editItem({ wght: value }) }} />

        </>
    );
}

function ItemDescription({ longDescription, text, onChange, spoilerStateHandler, isOpen, style }) {
    if (longDescription) {
        return (
            <ControlledSpoiler
                isOpen={isOpen}
                stateHandler={spoilerStateHandler}
                preview={<TextInput style={{ height: "30px", width: "69%", ...style }} value={text} onChange={onChange} />}
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
    else return (
        <TextInput
            style={{ width: "90%", height: "30px", ...style }}
            value={text}
            onChange={onChange}
        />
    );
};

function InventoryHead() {
    const { isEditingElements } = useContext(EditorContext);
    return (
        <>
            {isEditingElements ?
                <>
                    <div style={{ gridColumn: "0/4" }}>Name/Desc</div>
                    <div style={{ gridColumn: "4/10" }}>other</div>
                    <div style={{ gridColumn: "13/-1" }}>page</div>
                </>
                :
                <>
                    <div style={{ gridColumn: "0/12" }}>Name/Desc</div>
                    <div style={{ gridColumn: "13/15" }}>qty</div>
                    <div style={{ gridColumn: "15/-1" }}>wght</div>
                </>
            }
        </>
    );
}