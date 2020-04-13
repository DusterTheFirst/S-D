/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { observable } from "mobx";
import { persist } from "mobx-persist";
import ICard from "./card";

/** The persistant data of a card group */
export interface ICardGroupData {
    /** The name of the group */
    readonly name: string;
    /** The defaults for the cards */
    readonly defaults: ICard;
    /** The child cards of the group */
    readonly cards: ICard[];
}

/** A group of cards */
export default class CardGroup {
    /** The name of the group */
    @observable @persist
    public name: string;
    /** The defaults for the cards */
    @observable @persist("object")
    public defaults: ICard;
    /** The child cards of the group */
    @observable @persist("list")
    private readonly cards: ICard[];

    /** The amount of cards in the group */
    public get length() {
        return this.cards.length;
    }

    constructor(name = "", defaults: ICard = {}, cards: ICard[] = []) {
        this.name = name;
        this.cards = cards;
        this.defaults = defaults;
    }

    /** Add a card to the group */
    public addCard(card: ICard = {}) {
        if (card.name === undefined) {
            card.name = "Unnamed";
        }

        return this.cards.push(card);
    }

    /** Move a cards position */
    public moveCard(oldpos: number, newpos: number): this {
        const [card] = this.cards.splice(oldpos, 1);
        this.cards.splice(newpos, 0, card);

        return this;
    }

    /** Get the cards stored in the group */
    public getCards(): ICard[] {
        return this.cards.map(card => ({ ...this.defaults, ...card }));
    }

    /** Get the cards stored in the group without their defaults applied */
    public getRawCards(): ICard[] {
        return this.cards;
    }

    /** Get a card from the group */
    public getCard(i: number): ICard {
        return { ...this.defaults, ...this.cards[i] };
    }

    /** Get a card from the group without the defaults applied */
    public getRawCard(i: number): ICard {
        return this.cards[i];
    }

    /** Remove a card from the group */
    public removeCard(i: number): ICard {
        return this.cards.splice(i, 1)[0];
    }

    /** Change the value of a card in the group */
    public editCard<K extends keyof ICard>(card: number, key: K, value: ICard[K]) {
        this.cards[card] = { ...this.cards[card], [key]: value };
    }

    /** Change the value of the groups defaults */
    public editDefaults<K extends keyof ICard>(key: K, value: ICard[K]) {
        this.defaults = { ...this.defaults, [key]: value };
    }

    /** Change the value of the groups defaults */
    public editName(name: string) {
        this.name = name;
    }
}