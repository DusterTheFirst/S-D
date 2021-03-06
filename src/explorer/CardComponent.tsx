/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import { CardTitle } from "../styles/explorer/card";
import { BetterMenuProvider } from "./ContextMenu";
import { highlightMatches } from "./Explorer";

/** The props */
interface IProps {
    /** The card id */
    id: number;
    /** The group id */
    groupId: number;
    /** The search term */
    search: string;
}

/** Filter for cards */
export function cardFilter(filter: string) {
    return (card: ICard) => (card.name.toLowerCase().includes(filter.toLowerCase()));
}

/** A card component in the explorer */
export default function CardComponent({ groupId, id, search }: IProps) {
    const state = useContext(GlobalStateContext);

    const select = () => state.select(groupId, id);

    return useObserver(() => {
        const card = state.groups[groupId].cards[id];

        // Hide the card if there is a search term AND
        const hidden = search !== "" && (
            // If the group is not selected AND
            state.selection.type !== SelectionType.Card
            || state.selection.card !== id
            || state.selection.group !== groupId
            // Or if it is a match
        ) && !cardFilter(search)(card);

        return (
            <BetterMenuProvider id="card-contextmenu" selection={{ type: SelectionType.Card, card: id, group: groupId }}>
                <CardTitle
                    selected={state.selection.type === SelectionType.Card && state.selection.card === id && state.selection.group === groupId}
                    onClick={select}
                    hidden={hidden}
                >
                    {/* Highlight any text in the card that matches the search query */}
                    {highlightMatches(card.name, search)}
                </CardTitle>
            </BetterMenuProvider>
        );
    });
}