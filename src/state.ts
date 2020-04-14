/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { observable, when, action } from "mobx";
import { persist } from "mobx-persist";
import { createContext } from "react";
import ICard from "./card/card";
import CardGroup, { ICardGroupData } from "./card/cardGroup";

/** The tag for the selection enum */
export enum SelectionType {
    None = "none",
    Group = "group",
    Card = "card",
}

/** The user's selection */
export type UserSelection = {
    /** The type of selection */
    type: SelectionType.None;
} | {
    /** The type of selection */
    type: SelectionType.Group;
    /** The current selected group */
    group: {
        /** The group id */
        id: number;
        /** The card group */
        value: CardGroup;
    };
} | {
    /** The type of selection */
    type: SelectionType.Card;
    /** The current selected group */
    group: {
        /** The group id */
        id: number;
        /** The card group */
        value: CardGroup;
    };
    /** The current selected card */
    card: {
        /** The card id */
        id: number;
        /** The filled card */
        filled: ICard;
        /** The raw card */
        raw: ICard;
    };
};

/** The user's selection */
export type BareSelection = {
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
    private _selection: BareSelection = { type: SelectionType.None };
    /** The groups of cards */
    @observable @persist("list", CardGroup)
    private readonly _groups: CardGroup[] = [];

    constructor() {
        // Make sure the selected group exists, if not, remove the selection
        when(
            () => (this.selection.type === SelectionType.Group || this.selection.type === SelectionType.Card) && this.selection.group >= this._groups.length,
            () => this._selection = { type: SelectionType.None }
        );
        // Make sure the selected card exists, if not, remove the selection
        when(
            () => this.selection.type === SelectionType.Card && this.selection.card >= this._groups[this.selection.group].length,
            () => this._selection = { type: SelectionType.None }
        );
    }

    /** The current selection */
    public get selection(): BareSelection {
        if (this._selection.type === SelectionType.None) {
            
        } else if (this._selection.type === SelectionType.Group) {
            return {
                group: {
                    id: this._selection.group,
                    value: this._groups[this._selection.group]
                },
                type: SelectionType.Group
            };
        } else {
            return {
                card: {
                    filled: this._groups[this._selection.group].getCard(this._selection.card),
                    id: this._selection.card,
                    raw: this._groups[this._selection.group].getRawCard(this._selection.card)
                },
                group: {
                    id: this._selection.group,
                    value: this._groups[this._selection.group]
                },
                type: SelectionType.Card
            };
        }
    }

    /** The amount of groups in the store */
    public get groupCount() {
        return this._groups.length;
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
    public moveGroup(oldpos: number, newpos: number) {
        const [group] = this._groups.splice(oldpos, 1);
        this._groups.splice(newpos, 0, group);
    }
}

/** The global state context */
export const GlobalStateContext = createContext(new GlobalState());