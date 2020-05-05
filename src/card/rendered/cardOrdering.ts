/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Content } from "pdfmake/interfaces";

/** The width of a card tile for a double sided layout */
const CARD_TILE_WIDTH = 612 / 3;
/** The height of a card tile for a double sided layout */
const CARD_TILE_HEIGHT = 792 / 3;

/** The printed card width */
const PRINT_CARD_WIDTH = (CARD_TILE_HEIGHT / 70) * 50;
/** The printed card height */
const PRINT_CARD_HEIGHT = CARD_TILE_HEIGHT;

/** Method to order the cards in a double sided arrangement */
export function doubleSideOrdering(cards: Array<[string, string]>) {
    return cards.map<[Content, Content]>(([front, back], i) => {
        // Calculate the Y of the card
        const cardY = (Math.floor(i / 3) * CARD_TILE_HEIGHT) % (CARD_TILE_HEIGHT * 3);
        // Calculate the X of the card
        const cardX = (i % 3) * CARD_TILE_WIDTH;

        return [
            {
                // Set the front's position
                absolutePosition: {
                    x: cardX,
                    y: cardY
                },
                height: CARD_TILE_HEIGHT,
                svg: front,
                width: CARD_TILE_WIDTH,
            },
            {
                // Set the cards position, reversing direction
                absolutePosition: {
                    x: (CARD_TILE_WIDTH * 2) - cardX,
                    y: cardY
                },
                height: CARD_TILE_HEIGHT,
                // Add a page break before the card if first and after the card if last
                pageBreak:
                    cardY === 0 && cardX === 0
                        ? "before"
                        : cardY === CARD_TILE_HEIGHT * 2 && cardX === CARD_TILE_WIDTH * 2
                            ? "after"
                            : undefined,
                svg: back,
                width: CARD_TILE_WIDTH
            },
        ];
    }).reduce<[Content, Content[], Content[]]>(([done, fronts, backs], [front, back], i) => {
        // Interweave the fronts and backs for a double sided print
        if (i % 9 === 0) {
            return [[...done, ...fronts, ...backs], [front], [back]];
        } else {
            return [done, [...fronts, front], [...backs, back]];
        }
    }, [[], [], []]);
}

/** Method to order the cards in a foldable arrangement */
export function foldableOrdering(cards: Array<[string, string]>) {
    return cards.map<[Content, Content]>(([front, back], i) => {
        // Calculate the Y of the card
        const cardY = (i * PRINT_CARD_HEIGHT) % (PRINT_CARD_HEIGHT * 3);

        return [
            {
                // Set the front's position
                absolutePosition: {
                    x: 0,
                    y: cardY
                },
                height: PRINT_CARD_HEIGHT,
                svg: front,
                width: PRINT_CARD_WIDTH,
            },
            {
                // Set the cards position
                absolutePosition: {
                    x: PRINT_CARD_WIDTH,
                    y: cardY
                },
                height: PRINT_CARD_HEIGHT,
                pageBreak:
                    cardY === PRINT_CARD_HEIGHT * 2 && i !== cards.length - 1
                        ? "after"
                        : undefined,
                svg: back,
                width: PRINT_CARD_WIDTH
            },
        ];
    });
}