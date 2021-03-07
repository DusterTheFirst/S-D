/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { action, observable } from "mobx";
import { persist } from "mobx-persist";
import ICard from "./card";

/** The persistent data of a card group */
export interface ICardGroupData {
    /** The name of the group */
    readonly name: string;
    /** The defaults for the cards */
    readonly defaults: Partial<ICard>;
    /** The child cards of the group */
    readonly cards: ICard[];
}

/** The defaults that can be from a card group */
type ICardGroupDefaults = Omit<ICard, "name">;

/** A group of cards */
export default class CardGroup {
    /** The name of the group */
    @observable @persist
    public name: string;
    /** The defaults for the cards */
    @observable @persist("object")
    public defaults: ICardGroupDefaults;
    /** The child cards of the group */
    @observable @persist("list")
    private readonly _cards: ICard[];

    constructor(name = "", defaults: ICardGroupDefaults = {}, cards: ICard[] = []) {
        this.name = name;
        this._cards = cards;
        this.defaults = defaults;
    }

    /** Create a card group from a data object */
    public static fromData(data: ICardGroupData) {
        return new CardGroup(data.name, data.defaults, data.cards);
    }

    /** Method to get the jsonifyable data for the group */
    public get data(): ICardGroupData {
        return {
            cards: this._cards,
            defaults: this.defaults,
            name: this.name
        };
    }

    /** Add a card to the group */
    @action
    public addCard(card: ICard = { name: `New Card ${this._cards.length}` }) {
        return this._cards.push(card) - 1;
    }

    /** Move a cards position */
    @action
    public moveCard(oldPos: number, newPos: number): this {
        const [card] = this._cards.splice(oldPos, 1);
        this._cards.splice(newPos, 0, card);

        return this;
    }

    /** Get the cards stored in the group */
    public get cards(): ICard[] {
        return this._cards.map(card => ({ ...this.defaults, ...card }));
    }

    /** Get the cards stored in the group without their defaults applied */
    public get rawCards(): ICard[] {
        return this._cards;
    }

    /** Remove a card from the group */
    @action
    public removeCard(i: number): ICard {
        return this._cards.splice(i, 1)[0];
    }

    /** Change the value of a card in the group */
    @action
    public editCard<K extends keyof ICard>(card: number, key: K, value: ICard[K]) {
        this._cards[card] = Object.entries({ ...this._cards[card], [key]: value })
            // Remove undefined props
            .filter(([, v]) => v !== undefined)
            .reduce<ICard>((pre, [k, v]) => ({ ...pre, [k]: v }), {} as unknown as ICard);
    }

    /** Change the value of the groups defaults */
    @action
    public editDefaults<K extends keyof ICard>(key: K, value: ICard[K]) {
        this.defaults = Object.entries({ ...this.defaults, [key]: value })
            // Remove undefined props
            .filter(([, v]) => v !== undefined)
            .reduce<Partial<ICard>>((pre, [k, v]) => ({ ...pre, [k]: v }), {});
    }

    /** Change the value of the groups defaults */
    @action
    public editName(name: string) {
        this.name = name;
    }
}