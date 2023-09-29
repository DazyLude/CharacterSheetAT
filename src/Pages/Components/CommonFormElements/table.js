import { createElement, useState } from "react";
import UseEffectButton from "../useEffectButton";
import { useContext } from "react";
import { AppContext } from "../appContext";

// Table is a React component that implements shared behaviour between inventory and spellList sheet elements
// It is a stateful component, since it has to manage long descriptions of displayed data

// > title - jsx element that is displayed at the top of the table
// > head - jsx element that is displayed at the top of the column
// > data - an object from characterData, has the following fields:
//      | dataSet - hashMap with the entryId: entry pairs
//      | count - the last issued entryId
//      both fields are assigned default values if not found
// > columnStyle - css inline style object with widths
// > column - number of columns.
// > itemElement - jsx element that displays entries, can have the following props:
//      | entry - displayed data
//      | editItem - callback function that accepts changed entry object, should be called when changes are made to the entry
//      | removeItem - callback function with no parametres
//      | isOpen - whether this itemElement has any open spoilers or not
//      | spoilerStateHandler - callback function to call when user opens (or closes) a spoiler within this element
// > defaultItemObject - js object that has all the default fields an entry should have.
// > dispatcher - function to manipulate character data aka character dispatch

export default function Table({data, itemElement, defaultItemObject, dispatcher, children, columns, columnStyle, Head}) {
    const [openedSpoiler, setOpenedSpoiler] = useState("");
    const { isEditingElements } = useContext(AppContext);
    const count = data.count ?? 0;
    const dataSet = data.dataSet ?? {};


    const incrementCount = () => {
        dispatcher({type: "change-grid-element", merge: {count: count + 1}});
    }

    const addItem = () => {
        const newItem = defaultItemObject;
        dispatcher({type: "add-set-item", itemId: count + 1, item: newItem});
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

    const setItemPosition = (displacedItem, position) => {
        dispatcher({
            type: "merge-set-item",
            itemId: displacedItem,
            merge: position,
        })
    }

    const displayItems = Object.entries(dataSet).map(([id, entry]) => {
        entry ??= {};
        const isOpenIfSpoilered = openedSpoiler === id;
        return createElement(
                itemElement,
                {
                    key: id,
                    entry,
                    editItem: (entry) => {editItem(id, entry)},
                    removeItem: () => {removeItem(id)},
                    isOpen: isOpenIfSpoilered,
                    spoilerStateHandler: () => {setOpenedSpoiler(isOpenIfSpoilered ? "" : id)},
                }
            )
        }
    );

    return(
        <>
            <div style={{height: "30px", display: "flex", justifyContent: "space-around"}}>
                {children}
                {
                    isEditingElements ?
                    <UseEffectButton
                        style={{
                            height: "18px",
                            width: "300px",
                            padding: "0px 5px 2px"
                        }}
                        title="add"
                        action={() => {
                            incrementCount();
                            addItem();
                        }}
                    />
                    :
                    null
                }
            </div>
            <div
                style={{
                    display: "grid",
                    width: "100%",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    columnGap: "20px",
                    margin: "10px"
                }}>
                <TableColumns Head={Head} columnStyle={columnStyle} columns={columns} displayItems={displayItems} setItemPosition={setItemPosition}/>
            </div>
        </>
    );
}

function TableColumns({columns, columnStyle, Head, displayItems, setItemPosition}) {
    columns ??= 1;
    Head ??= <></>;

    // sorting items on per column basis
    const columnItems = [];
    for (let i = 0; i < columns; i++) {
        columnItems.push([]);
    }

    displayItems.forEach(item => {
        const tablePosition = item.props.entry.tablePosition ?? [0, 0];
        columnItems[tablePosition[0] ?? 0].push(item);
    });

    columnItems.forEach(arrayOfItems => {
        const cmpFn = (itemA, itemB) => {
            const tablePositionA = itemA.props.entry.tablePosition ?? [0, 0];
            const tablePositionB = itemB.props.entry.tablePosition ?? [0, 0];
            const rowA = tablePositionA[1] ?? 0;
            const rowB = tablePositionB[1] ?? 1;
            return rowA - rowB;
        }
        arrayOfItems.sort(cmpFn);
    });

    const displayColumns = [];
    for (let i = 0; i < columns; i++) {
        displayColumns.push(
            <div
                className="form-subscript"
                style={{...columnStyle, alignItems: 'start'}}
                key={i}
            >
                <Head/>
                {columnItems[i]}
            </div>
        )
    }
    return displayColumns;
}