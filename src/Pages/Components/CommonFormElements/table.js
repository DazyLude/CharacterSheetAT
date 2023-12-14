import { createElement, useCallback, useState } from "react";
import UseEffectButton from "./useEffectButton";
import { useContext } from "react";
import { EditorContext } from "../Systems/appContext";

// Table is a React component that implements shared behaviour between inventory and spellList sheet elements
// It is a stateful component, since it has to manage long descriptions of displayed data

// > title - jsx element that is displayed at the top of the table
// > head - jsx element that is displayed at the top of the column
// > data - an object from characterData, has the following fields:
//      | dataSet - hashMap with the entryId: entry pairs
//      | count - the last issued entryId
//      both fields are assigned default values if not found
// > columnStyle - css inline style object with widths
// > columns - number of columns. Must be a Number type
// > itemElement - jsx element that displays entries, can have the following props:
//      | entry - displayed data
//      | editItem - callback function that accepts changed entry object, should be called when changes are made to the entry
//      | removeItem - callback function with no parametres
//      | isOpen - whether this itemElement has any open spoilers or not
//      | spoilerStateHandler - callback function to call when user opens (or closes) a spoiler within this element
// > defaultItemObject - js object that has all the default fields an entry should have.
// > dispatcher - function to manipulate character data aka character dispatch

export function Table({data, itemElement, defaultItemObject, dispatcher, children, columns, columnStyle, Head}) {
    const [ openedSpoilerId, setOpenedSpoilerId ] = useState("");
    const { isEditingElements } = useContext(EditorContext);
    const tableEntries = Object.entries(data.dataSet ?? {});
    const count = data.count ?? 0;

    const columnPopulation = Array(columns);

    for (let index = 0; index < columns; index++) {
        columnPopulation[index] = 0;
    }

    const openedSpoilerIdHandler = useCallback(
        (callerId) => {
            if (callerId === openedSpoilerId) {
                setOpenedSpoilerId("")
            } else {
                setOpenedSpoilerId(callerId);
            }
        },
        [openedSpoilerId, setOpenedSpoilerId]
    )

    tableEntries.forEach(([_, entry]) => {
        columnPopulation[(entry.placement ?? [0])[0] % columns] += 1;
    });

    const smallestPopulation = columnPopulation.reduce(
        (leastSoFar, current) => {
            leastSoFar ??= current;
            if (current < leastSoFar) {
                return current;
            }
            return leastSoFar;
        },
        undefined
    );

    const leastPopulatedColumn = columnPopulation.indexOf(smallestPopulation);
    const lowestWeight = tableEntries.reduce(
        (leastSoFar, [_, entry]) => {
            const [currentColumn, currentWeight] = entry.placement ?? [0,0];
            if (currentColumn % columns !== leastPopulatedColumn) {
                return leastSoFar;
            }
            leastSoFar ??= currentWeight;
            if (currentWeight < leastSoFar) {
                return currentWeight;
            }
            return leastSoFar;
        },
        undefined
    ) ?? 0;

    const incrementCount = () => {
        dispatcher({merge_object: {count: count + 1}});
    }

    const addItem = () => {
        const newItem = defaultItemObject;
        dispatcher({
            value_name: `${count + 1}`,
            new_value: {
                ...newItem,
                placement: [leastPopulatedColumn, lowestWeight]
            }
        });
    }

    const removeItem = (removedItemId) => {
        dispatcher({
            value_name: `${removedItemId}`,
        })
    }

    const editItem = (replacedItemId, replacement) => {
        dispatcher({
            value_name: `${replacedItemId}`,
            merge_object: replacement,
        })
    }
    const displayItems = tableEntries.map(([id, entry]) => {
        entry ??= {};
        return createElement(
                itemElement,
                {
                    key: id,
                    entry,
                    editItem: (merge) => {editItem(id, merge)},
                    removeItem: () => {removeItem(id)},
                    isOpen: (id === openedSpoilerId),
                    spoilerStateHandler: () => {openedSpoilerIdHandler(id)}
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
                }}
            >
                <TableColumns Head={Head} columnStyle={columnStyle} columns={columns} displayItems={displayItems}/>
            </div>
        </>
    );
}

function TableColumns({columns, columnStyle, Head, displayItems}) {
    columns ??= 1;
    Head ??= <></>;

    // sorting items on per column basis
    const columnItems = [];
    for (let i = 0; i < columns; i++) {
        columnItems.push([]);
    }


    displayItems.forEach(item => {
        let tablePosition = item.props.entry.placement;
        if (typeof(tablePosition) === 'undefined') {
            tablePosition = [0, 0];
        }
        let column = (tablePosition[0] ?? 0) % columns;
        if (columnItems[column] === undefined) {
            column = 0;
        }
        columnItems[column].push(item);
    });

    columnItems.forEach(arrayOfItems => {
        const cmpFn = (itemA, itemB) => {
            const tablePositionA = itemA.props.entry.placement ?? [0, 0];
            const tablePositionB = itemB.props.entry.placement ?? [0, 0];
            const weightA = tablePositionA[1] ?? 0;
            const weightB = tablePositionB[1] ?? 1;
            return weightA - weightB;
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
    return(<>{displayColumns}</>);
}