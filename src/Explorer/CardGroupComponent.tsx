/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useObserver } from "mobx-react-lite";
import React, { useContext, useMemo, useState } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import CardComponent from "./CardComponent";
import { BetterMenuProvider } from "./ContextMenu";
import { highlightMatches } from "./Explorer";

interface IProps {
    id: number;
    search: string;
}

export default function CardGroupComponent({ id, search }: IProps) {
    const [collapsed, setCollapsed] = useState(false);
    const state = useContext(GlobalStateContext);

    const group = useObserver(() => state.getGroup(id));

    const cardFilter = (filter: string) => {
        return (card: ICard) => (card.name !== undefined && card.name.toLowerCase().includes(filter.toLowerCase()));
    };

    // Hide the group if there is a search term AND
    const hidden = search !== "" && (
        // If there are no cards in the group that match the filter
        group.getCards().filter(cardFilter(search)).length === 0
        // AND the name of the group does not match
        && !group.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCollapse = () => setCollapsed(!collapsed);

    const cards = useMemo(() => group.getCards()
        // Map the cards to elements
        .map((card, j) => {
            // Hide the card if there is a search term AND
            const cardHidden = search !== "" && (
                // If the group is not selected AND
                state.selection.type !== SelectionType.Card
                || state.selection.card.id !== j
                || state.selection.group.id !== id
            ) && (
                    // If the group is collapsed
                    collapsed
                    // Or if it is a match
                    || cardFilter(search)(card)
                );

            return <CardComponent key={j} id={j} groupid={id} hidden={cardHidden} search={search} />;
        }), [collapsed, group, id, search, state]);

    return useObserver(() => (
        <BetterMenuProvider id="group-contextmenu" selection={{ type: SelectionType.Group, group: id }}>
            <div
                className={`group ${state.selection.type === SelectionType.Group && state.selection.group.id === id ? "selected" : "notselected"}`}
                hidden={hidden}
            >
                <div className="title" onClick={toggleCollapse}>
                    <div className="caret">
                        <FontAwesomeIcon icon={collapsed ? faCaretRight : faCaretDown} />
                    </div>
                    <div className="name">
                        {/* Highlight any text in the name that matches the search query */}
                        {highlightMatches(group.name, search)}
                    </div>
                </div>
                <div className="cards">
                    {cards}
                </div>
            </div>
        </BetterMenuProvider>
    ));
}