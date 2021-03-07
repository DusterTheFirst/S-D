/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { action, observable } from "mobx";
import { persist } from "mobx-persist";
import { createContext } from "react";
import CardGroup, { ICardGroupData } from "./card/cardGroup";

/** The tag for the selection enum */
export enum SelectionType {
    None = "none",
    Group = "group",
    Card = "card",
}

/** The user's selection */
export type Selection = {
    /** The type of selection */
    type: SelectionType.None;
} | {
    /** The type of selection */
    type: SelectionType.Group;
    /** The current selected group */
    group: number;
} | {
    /** The type of selection */
    type: SelectionType.Card;
    /** The current selected group */
    group: number;
    /** The current selected card */
    card: number;
};

/** The global state of the application */
export class GlobalState {
    /** The current selection */
    @observable @persist("object")
    private _selection: Selection = { type: SelectionType.None };
    /** The groups of cards */
    @observable @persist("list", CardGroup)
    private readonly _groups: CardGroup[] = [];

    /** The current selection */
    public get selection(): Selection {
        return this._selection;
    }

    /** Select a group and or a card */
    @action
    public select(group?: number, card?: number) {
        if (group === undefined) {
            this._selection = { type: SelectionType.None };
        } else if (card === undefined) {
            this._selection = {
                group,
                type: SelectionType.Group
            };
        } else {
            this._selection = {
                card,
                group,
                type: SelectionType.Card
            };
        }
    }

    /** A way to set the selection directly */
    @action
    public setSelection(selection: Selection) {
        this._selection = selection;
    }

    /** Add a group */
    @action
    public addGroup(group: CardGroup) {
        return this._groups.push(group) - 1;
    }

    /** Remove a group */
    @action
    public removeGroup(group: number) {
        return this._groups.splice(group, 1)[0];
    }

    /** Get a group */
    public get groups() {
        return this._groups;
    }

    /** Get a group */
    public get groupsData(): ICardGroupData[] {
        return this._groups.map(x => x.data);
    }

    /** Move a group */
    @action
    public moveGroup(oldPos: number, newPos: number) {
        const [group] = this._groups.splice(oldPos, 1);
        this._groups.splice(newPos, 0, group);
    }
}

/** The global state context */
export const GlobalStateContext = createContext(new GlobalState());