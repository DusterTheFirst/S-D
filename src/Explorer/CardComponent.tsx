/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext } from "react";
import { MenuProvider } from "react-contexify";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import { highlightMatches } from "./Explorer";

interface IProps {
    card: ICard;
    id: number;
    groupid: number;
    hidden: boolean;
    search: string;
}

export default function CardComponent({ card, groupid, hidden, id, search }: IProps) {
    const state = useContext(GlobalStateContext);

    const select = () => state.select(groupid, id);

    return useObserver(() => (
        <MenuProvider id="card-contextmenu" data={{ type: SelectionType.Card, card: id, group: groupid }}>
            <div
                className={`card ${state.selection.type === SelectionType.Card && state.selection.card.id === id && state.selection.group.id === groupid ? "selected" : "notselected"}`}
                onClick={select}
                hidden={hidden}
            >
                {/* Highlight any text in the card that matches the search query */}
                {highlightMatches(card.name, search)}
            </div>
        </MenuProvider>
    ));
}