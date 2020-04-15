/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Observer, useObserver } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import { GlobalStateContext, SelectionType } from "../state";
import CardComponent, { cardFilter } from "./CardComponent";
import { BetterMenuProvider } from "./ContextMenu";
import { highlightMatches } from "./Explorer";

/** The props */
interface IProps {
    /** The card id */
    id: number;
    /** The search term */
    search: string;
}

/** A component to show a card group in the side panel */
export default function CardGroupComponent({ id, search }: IProps) {
    const [collapsed, setCollapsed] = useState(false);
    const state = useContext(GlobalStateContext);

    // Hide the group if there is a search term AND
    const hidden = useObserver(() => search !== "" && (
        // If there are no cards in the group that match the filter
        state.groups[id].cards.filter(cardFilter(search)).length === 0
        // AND the name of the group does not match
        && !state.groups[id].name.toLowerCase().includes(search.toLowerCase())
    ));

    const toggleCollapse = () => setCollapsed(!collapsed);

    return useObserver(() => (
        <BetterMenuProvider id="group-contextmenu" selection={{ type: SelectionType.Group, group: id }}>
            <div
                className={`group ${state.selection.type === SelectionType.Group && state.selection.group === id ? "selected" : "notselected"}`}
                hidden={hidden}
            >
                <div className="title" onClick={toggleCollapse}>
                    <div className="caret">
                        <FontAwesomeIcon icon={collapsed ? faCaretRight : faCaretDown} />
                    </div>
                    <div className="name">
                        {/* Highlight any text in the name that matches the search query */}
                        <Observer>{() => <>{highlightMatches(state.groups[id].name, search)}</>}</Observer>
                    </div>
                </div>
                <div className="cards" hidden={collapsed}>
                    <Observer>{() => <>{state.groups[id].cards.map((_, j) => <CardComponent key={j} id={j} groupid={id} search={search} />)}</>}</Observer>
                </div>
            </div>
        </BetterMenuProvider>
    ));
}