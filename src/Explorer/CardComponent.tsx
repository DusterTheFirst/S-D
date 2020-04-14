/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { GlobalStateContext, SelectionType } from "../state";
import { BetterMenuProvider } from "./ContextMenu";
import { highlightMatches } from "./Explorer";

interface IProps {
    id: number;
    groupid: number;
    hidden: boolean;
    search: string;
}

export default function CardComponent({ groupid, hidden, id, search }: IProps) {
    const state = useContext(GlobalStateContext);

    const select = () => state.select(groupid, id);

    const cardName = () => (
        <div
            className={`card ${state.selection.type === SelectionType.Card && state.selection.card.id === id && state.selection.group.id === groupid ? "selected" : "notselected"}`}
            onClick={select}
            hidden={hidden}
        >
            {/* Highlight any text in the card that matches the search query */}
            {highlightMatches(state.getGroup(groupid).getCard(id).name, search)}
        </div>
    );

    return (
        <BetterMenuProvider id="card-contextmenu" selection={{ type: SelectionType.Card, card: id, group: groupid }}>
            <Observer>{cardName}</Observer>
        </BetterMenuProvider>
    );
}