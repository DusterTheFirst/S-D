import Card from "./Card";

// export default class CardRenderer {
//     private front: HTMLCanvasElement;
//     private back: HTMLCanvasElement;

//     constructor() {
//         this.front = document.createElement("canvas");
//         this.back = document.createElement("canvas");
//     }

//     public renderCard(card: Card): IRenderedCard {
//         return {

//         };
//     }
// }

export interface IRenderedCard {
    front: HTMLCanvasElement;
    back: HTMLCanvasElement;
    card: Card;
}