import { createElement, useState } from "react";
import DataExplorer from "./DataExplorer";
import VariableTable from "./VariableTable";

export default function Debug() {
    const [tab, setTab] = useState("data_explorer");

    let display;
    switch(tab) {
        case("dev"):
            display = createElement(VariableTable);
            break;
        case("data_explorer"):
        default:
            display = createElement(DataExplorer);
            break;

    }
    return (
        <>
            <select onChange={(e) => {setTab(e.target.value)}} value={tab}>
                <option value={"data_explorer"}>data explorer</option>
                <option value={"dev"}>dev</option>
            </select>
            <br />
            {display}
        </>
    );
}