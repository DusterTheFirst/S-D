import ICard from "./Card";

export interface ICardGroup {
    name: string;
    settings?: ICard;
    cards?: ICard[];
}
export default class CardGroup {
    public name: string;

    public settings: ICard;
    private readonly cards: ICard[];

    constructor(defaults: ICardGroup) {
        if ((defaults as { name?: string }).name === undefined) {
            throw TypeError("Given defaults are not of type ICardGroup");
        }

        this.cards = defaults.cards === undefined ? [] : defaults.cards;
        this.settings = defaults.settings === undefined ? {} : defaults.settings;
        this.name = defaults.name;
    }

    public addCard(card?: ICard): this {
        let cardtoadd: ICard = card === undefined ? {} : card;
        if (cardtoadd.name === undefined) {
            cardtoadd.name = "Unnamed";
        }

        this.cards.push(cardtoadd);

        return this;
    }

    public moveCard(card: number, newpos: number): this {
        let [oldcard] = this.cards.splice(card, 1);
        this.cards.splice(newpos, 0, oldcard);

        return this;
    }

    public getCards(): ICard[] {
        let outputcards: ICard[] = [];

        for (let i = 0; i < this.cards.length; i++) {
            outputcards.push(this.getCard(i));
        }

        return outputcards;
    }

    public getCard(i: number): ICard {
        let card = { ... this.cards[i] };

        // Inherit the settings
        for (let prop in this.settings) {
            if (!card[prop]) {
                card[prop] = this.settings[prop];
            }
        }

        return card;
    }

    public getRawCard(i: number): ICard {
        return this.cards[i];
    }

    public getRawCards(): ICard[] {
        return this.cards;
    }

    public removeCard(i: number): ICard {
        return this.cards.splice(i, 1)[0];
    }

    public editCard(i: number, card: ICard) {
        this.cards[i] = card;
    }
}