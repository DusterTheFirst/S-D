/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Content } from "pdfmake/interfaces";

/** The margin, in points, of the page (https://stackoverflow.com/a/3513476) */
const PRINT_PAGE_MARGIN = 0.25 * 72; // 1 inch = 72 pts

/** The width, in points, of a letter page */
const LETTER_PAPER_WIDTH = 612;
/** The height, in points, of a letter page */
const LETTER_PAPER_HEIGHT = 792;

/** The width of a card tile for a double sided layout */
const CARD_TILE_WIDTH = (LETTER_PAPER_WIDTH - (PRINT_PAGE_MARGIN * 2)) / 3;
/** The height of a card tile for a double sided layout */
const CARD_TILE_HEIGHT = (LETTER_PAPER_HEIGHT - (PRINT_PAGE_MARGIN * 2)) / 3;

/** The printed card width */
const PRINT_CARD_WIDTH = (CARD_TILE_HEIGHT / 70) * 50;
/** The printed card height */
const PRINT_CARD_HEIGHT = CARD_TILE_HEIGHT;

/** Method to order the cards in a double sided arrangement */
export function doubleSideOrdering(cards: Array<[string, string]>) {
    return cards.map<[Content, Content]>(([front, back], i) => {
        const cardXIdx = i % 3;
        const cardYIdx = Math.floor(i / 3) % 3;

        // Calculate the Y of the card
        const cardY = (cardYIdx * CARD_TILE_HEIGHT) + PRINT_PAGE_MARGIN;
        // Calculate the X of the card
        const cardX = (cardXIdx * CARD_TILE_WIDTH) + PRINT_PAGE_MARGIN;

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
                // Add a page break before the card if first and after the card if last but not if it is the last card
                pageBreak:
                    i === cards.length - 1 ? undefined :
                        cardYIdx === 0 && cardXIdx === 0
                            ? "before"
                            : cardYIdx === 2 && cardXIdx === 2
                                ? "after"
                                : undefined,
                svg: back,
                width: CARD_TILE_WIDTH
            },
        ];
    }).reduce<[Content[], Content[], Content[]]>(([done, fronts, backs], [front, back], i) => {
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
        const cardYIdx = i % 3;

        // Calculate the Y of the card
        const cardY = (cardYIdx * PRINT_CARD_HEIGHT) + PRINT_PAGE_MARGIN;

        return [
            {
                // Set the front's position
                absolutePosition: {
                    x: PRINT_PAGE_MARGIN,
                    y: cardY
                },
                height: PRINT_CARD_HEIGHT,
                svg: front,
                width: PRINT_CARD_WIDTH,
            },
            {
                // Set the cards position
                absolutePosition: {
                    x: PRINT_CARD_WIDTH + PRINT_PAGE_MARGIN,
                    y: cardY
                },
                height: PRINT_CARD_HEIGHT,
                pageBreak:
                    cardYIdx === 2 && i !== cards.length - 1
                        ? "after"
                        : undefined,
                svg: back,
                width: PRINT_CARD_WIDTH
            },
        ];
    });
}