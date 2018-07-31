import ICard from "./Card";

export default class CardGroup {
    public name: string;

    public settings: ICard;
    private readonly cards: ICard[];

    constructor(name: string, settings?: ICard) {
        this.cards = [];
        this.settings = settings || {};
        this.name = name;
    }

    public addCard(card?: ICard): this {
        this.cards.push(card || {});

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
}