/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { observable, when } from "mobx";
import { persist } from "mobx-persist";
import { createContext } from "react";
import ICard from "./card/card";
import CardGroup from "./card/cardGroup";

/** The tag for the selection enum */
export enum SelectionType {
    Card,
    Group,
    None
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

/** The global state of the application */
export class GlobalState {
    /** The current selection */
    @observable @persist
    private _selection: UserSelection = { type: SelectionType.None };
    /** The groups of cards */
    @observable @persist
    private readonly _groups: CardGroup[] = [];

    constructor() {
        // Make sure the selected group exists, if not, remove the selection
        when(
            () => (this.selection.type === SelectionType.Group || this.selection.type === SelectionType.Card) && this.selection.group.id >= this.groups.length,
            () => this._selection = { type: SelectionType.None }
        );
        // Make sure the selected card exists, if not, remove the selection
        when(
            () => this.selection.type === SelectionType.Card && this.selection.card.id >= this.groups[this.selection.group.id].length,
            () => this._selection = { type: SelectionType.None }
        );
    }

    /** The current selection */
    public get selection() {
        return this._selection;
    }

    /** The groups of cards */
    public get groups() {
        return this._groups;
    }

    /** Select a group and or a card */
    public select(group?: number, card?: number) {
        if (group === undefined) {
            this._selection = { type: SelectionType.None };
        } else if (card === undefined) {
            this._selection = {
                group: {
                    id: group,
                    value: this._groups[group]
                },
                type: SelectionType.Group
            };
        } else {
            this._selection = {
                card: {
                    filled: this._groups[group].getCard(card),
                    id: card,
                    raw: this._groups[group].getRawCard(card)
                },
                group: {
                    id: group,
                    value: this._groups[group]
                },
                type: SelectionType.Card
            };
        }
    }

    /** Add a card to a group */
    public addCard(group: number, card: ICard = {}) {
        this.groups[group].addCard(card);
    }
    /** Add a group */
    public addGroup(group: CardGroup) {
        this._groups.push(group);
    }

    /** Remove a card from a group */
    public removeCard(group: number, card: number) {
        this._groups[group].removeCard(card);
    }
    /** Remove a group */
    public removeGroup(group: number) {
        return this._groups.splice(group, 1)[0];
    }

    /** Move a card in its group */
    public moveCard(group: number, oldpos: number, newpos: number) {
        this._groups[group].moveCard(oldpos, newpos);
    }
    // TODO:
    // public switchGroup(oldgroup: number, card: number, newgroup: number): void;

    /** Change the contents of a card to the new given information */
    public editCard<K extends keyof ICard>(group: number, card: number, key: K, value: ICard[K]) {
        this._groups[group].editCard(card, key, value);
    }
    /** Change the defaults of a group to the new given information */
    public editGroupDefaults<K extends keyof ICard>(group: number, key: K, value: ICard[K]) {
        this._groups[group].editDefaults(key, value);
    }
    /** Change the name of a group to the new given information */
    public editGroupName(group: number, name: string) {
        this._groups[group].editName(name);
    }

    // TODO: remove?
    // public setCardChanges(group: number, card: number, changes?: ICard): void;
    // public setGroupChanges(group: number, changes?: IGroupChanges): void;

    // public getCardChanges(group: number, card: number): ICard | undefined;
    // public getGroupChanges(group: number): IGroupChanges | undefined;
}

/** The global state context */
export const GlobalStateContext = createContext(new GlobalState());