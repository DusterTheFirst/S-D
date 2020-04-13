/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import ICard from "./card";

/** A bare representation of a group of cards with no helpers */
export interface ICardGroupMeta {
    /** The name of the group */
    name: string;
    /** The defaults for the cards */
    defaults: ICard;
}

/** A group of cards */
export default class CardGroup {
    /** The metadata of the group */
    public readonly metadata: ICardGroupMeta;
    /** The child cards of the group */
    private readonly cards: ICard[] = [];

    /** The amount of cards in the group */
    public get length() {
        return this.cards.length;
    }

    constructor(metadata: ICardGroupMeta) {
        this.metadata = metadata;
    }

    /** Add a card to the group */
    public addCard(card: ICard = {}): this {
        if (card.name === undefined) {
            card.name = "Unnamed";
        }

        this.cards.push(card);

        return this;
    }

    /** Move a cards position */
    public moveCard(oldpos: number, newpos: number): this {
        const [card] = this.cards.splice(oldpos, 1);
        this.cards.splice(newpos, 0, card);

        return this;
    }

    /** Get the cards stored in the group */
    public getCards(): ICard[] {
        return this.cards.map(card => ({ ...this.metadata.defaults, ...card }));
    }

    /** Get the cards stored in the group without their defaults applied */
    public getRawCards(): ICard[] {
        return this.cards;
    }

    /** Get a card from the group */
    public getCard(i: number): ICard {
        return { ...this.metadata.defaults, ... this.cards[i] };
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
        this.metadata.defaults = { ...this.metadata.defaults, [key]: value };
    }

    /** Change the value of the groups defaults */
    public editName(name: string) {
        this.metadata.name = name;
    }
}