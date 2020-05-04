/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import { Content } from "pdfmake/interfaces";
import React, { createContext, forwardRef, MutableRefObject, useCallback, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { IsRenderingContext } from "../../App";
import { GlobalState, GlobalStateContext, Selection, SelectionType } from "../../state";
import { CardContainer } from "../../styles/app";
import { dataFileReaderAsync } from "../../util/file";
import { canvasToBlobAsync, createImageAsync } from "../../util/image";
import CardBack from "./CardBack";
import CardFront from "./CardFront";

/** The width of the resulting rasters */
const RASTER_WIDTH = 1500;
/** The height of the resulting rasters */
const RASTER_HEIGHT = 2100;

/** The width of a card tile for a double sided layout */
const CARD_TILE_WIDTH = 612 / 3;
/** The height of a card tile for a double sided layout */
const CARD_TILE_HEIGHT = 792 / 3;

/** The printed card width */
const PRINT_CARD_WIDTH = (CARD_TILE_HEIGHT / 70) * 50;
/** The printed card height */
const PRINT_CARD_HEIGHT = CARD_TILE_HEIGHT;

/** The ref exposed by thr Rendered Cards component */
export interface IRenderedCardsRef {
    /** Render/Rasterize the card */
    render(selection: Selection): Promise<void>;
    /** Print the card */
    printDoubleSided(selection: Selection): Promise<void>;
}

/** The rendered callback context for the front of the card */
export const FrontRenderedCallbackContext = createContext<MutableRefObject<() => void>>({ current: () => void 0 });
/** The rendered callback context for the back of the card */
export const BackRenderedCallbackContext = createContext<MutableRefObject<() => void>>({ current: () => void 0 });

/** Method to order the cards in a double sided arrangement */
function doubleSideOrdering(cards: Array<[string, string]>) {
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

/** The rendered cards container and manager */
const RenderedCards = forwardRef<IRenderedCardsRef>((_, ref) => {
    const frontRef = useRef<SVGSVGElement>(null);
    const backRef = useRef<SVGSVGElement>(null);

    const frontRenderedCallback = useRef<() => void>(() => void 0);
    const backRenderedCallback = useRef<() => void>(() => void 0);

    const state = useContext(GlobalStateContext);
    const [, setIsRendering] = useContext(IsRenderingContext);

    useEffect(() => {
        Promise.all([
            fetch("/fonts/Modesto-Expd.ttf").then(x => x.blob()).then(dataFileReaderAsync),
            fetch("/fonts/Modesto-Regular.ttf").then(x => x.blob()).then(dataFileReaderAsync)
        ]).then(([expd, regular]) => {
            pdfMake.vfs = {
                "Modesto-Expd.ttf": expd.substring(expd.lastIndexOf(",") + 1),
                "Modesto-Regular.ttf": regular.substring(regular.lastIndexOf(",") + 1)
            };
            pdfMake.fonts = {
                "Modesto-Expd": {
                    normal: "Modesto-Expd.ttf"
                },
                "Modesto-Regular": {
                    bold: "Modesto-Regular.ttf",
                    normal: "Modesto-Regular.ttf"
                }
            };
        }).catch(e => console.error(e));
    }, []);

    const selectAsync = useCallback((...args: Parameters<GlobalState["select"]>) => Promise.race([
        new Promise((resolve) => {
            frontRenderedCallback.current = () => {
                frontRenderedCallback.current = () => void 0;
                backRenderedCallback.current = () => void 0;
                resolve();
            };

            state.select(...args);
        }),
        new Promise((resolve) => {
            backRenderedCallback.current = () => {
                frontRenderedCallback.current = () => void 0;
                backRenderedCallback.current = () => void 0;
                resolve();
            };
        }),
        new Promise((resolve) => setTimeout(resolve, 1000))
    ]), [state, frontRenderedCallback, backRenderedCallback]);

    const getCurrentSelectedSVGs = useCallback((): [string, string] => {
        // Make sure the svgs are actually rendered
        if (frontRef.current === null || backRef.current === null) {
            throw new ReferenceError("Attempted to render while the card was not rendered, please try again.");
        }

        // Setup exportable svg for the sides
        const svgFront = `<?xml version="1.0" encoding="utf-8"?>${frontRef.current.outerHTML}`;
        const svgBack = `<?xml version="1.0" encoding="utf-8"?>${backRef.current.outerHTML}`;

        return [svgFront, svgBack];
    }, [frontRef, backRef]);

    const renderCurrentSelection = useCallback(async (zip: JSZip = new JSZip()) => {
        // Create the rasterizing canvas
        const canvas = document.createElement("canvas");
        canvas.width = RASTER_WIDTH;
        canvas.height = RASTER_HEIGHT;
        // Get the rendering context
        const context = canvas.getContext("2d");

        // Make sure the context exists
        if (context === null) {
            throw new ReferenceError("Could not load canvas 2d context");
        }

        const [svgFront, svgBack] = getCurrentSelectedSVGs();

        // Save the vector images
        zip.file("front.svg", svgFront);
        zip.file("back.svg", svgBack);

        // Create rasterable Image objects from the svg
        const imageFront = await createImageAsync(`data:image/svg+xml;utf8,${encodeURIComponent(svgFront)}`);
        const imageBack = await createImageAsync(`data:image/svg+xml;utf8,${encodeURIComponent(svgBack)}`);

        // Rasterize the front of the card
        context?.drawImage(imageFront, 0, 0, RASTER_WIDTH, RASTER_HEIGHT);
        zip.file("front.png", await canvasToBlobAsync(canvas));

        // Rasterize the back of the card
        context?.drawImage(imageBack, 0, 0, RASTER_WIDTH, RASTER_HEIGHT);
        zip.file("back.png", await canvasToBlobAsync(canvas));

        // Rasterize the sides in a row formation
        canvas.width = RASTER_WIDTH * 2;
        canvas.height = RASTER_HEIGHT;
        context?.drawImage(imageFront, 0, 0, RASTER_WIDTH, RASTER_HEIGHT);
        context?.drawImage(imageBack, RASTER_WIDTH, 0, RASTER_WIDTH, RASTER_HEIGHT);
        zip.file("row.png", await canvasToBlobAsync(canvas));

        // Rasterize the sides in a column formation
        canvas.width = RASTER_WIDTH;
        canvas.height = RASTER_HEIGHT * 2;
        context?.drawImage(imageFront, 0, 0, RASTER_WIDTH, RASTER_HEIGHT);
        context?.drawImage(imageBack, 0, RASTER_HEIGHT, RASTER_WIDTH, RASTER_HEIGHT);
        zip.file("column.png", await canvasToBlobAsync(canvas));

        // Remove the canvas from the DOM
        canvas.remove();

        // Return the packaged zip
        return zip;
    }, [getCurrentSelectedSVGs]);

    useImperativeHandle<IRenderedCardsRef, IRenderedCardsRef>(ref, () => ({
        printDoubleSided: async (selection: Selection) => {
            // Move into rendering mode
            setIsRendering(true);

            // Save the previous selection
            const preselect = state.selection;

            if (selection.type === SelectionType.Group) {
                const svgs: Array<[string, string]> = [];

                for (let card = 0; card < state.groups[selection.group].cards.length; card++) {
                    // Select and render the current card
                    await selectAsync(selection.group, card);

                    const csvgs = getCurrentSelectedSVGs();

                    svgs.push(csvgs);
                }

                pdfMake.createPdf({
                    content: doubleSideOrdering(svgs),
                    pageMargins: 0,
                    pageSize: "LETTER",
                }).print();
            } else if (selection.type === SelectionType.Card) {
                // Select and render the current card
                await selectAsync(selection.group, selection.card);

                const [svgFront, svgBack] = getCurrentSelectedSVGs();

                // Make a simple pdf of one side of the card on each page
                pdfMake.createPdf({
                    content: [
                        {
                            height: PRINT_CARD_HEIGHT,
                            svg: svgFront,
                            width: PRINT_CARD_WIDTH
                        },
                        {
                            height: PRINT_CARD_HEIGHT,
                            pageBreak: "before",
                            style: {
                                alignment: "right"
                            },
                            svg: svgBack,
                            width: PRINT_CARD_WIDTH,
                        }
                    ],
                    pageMargins: 0,
                    pageSize: "LETTER",
                }).print();
            } else {
                const svgs: Array<[string, string]> = [];

                for (let group = 0; group < state.groups.length; group++) {
                    for (let card = 0; card < state.groups[group].cards.length; card++) {
                        // Select and render the current card
                        await selectAsync(group, card);

                        const csvgs = getCurrentSelectedSVGs();

                        svgs.push(csvgs);
                    }
                }

                pdfMake.createPdf({
                    content: doubleSideOrdering(svgs),
                    pageMargins: 0,
                    pageSize: "LETTER",
                }).print();
            }

            // Return selection
            state.setSelection(preselect);

            // Leave rendering mode
            setIsRendering(false);
        },
        render: async (selection: Selection) => {
            // Move into rendering mode
            setIsRendering(true);

            // Save the previous selection
            const preselect = state.selection;

            if (selection.type === SelectionType.Group) {
                // Create zip file
                const zip = new JSZip();

                for (let card = 0; card < state.groups[selection.group].cards.length; card++) {
                    // Select and render the current card
                    await selectAsync(selection.group, card);

                    // Render and export the cards into a new zip file
                    await renderCurrentSelection(zip.folder(state.groups[selection.group].cards[card].name));
                }

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), state.groups[selection.group].name);
            } else if (selection.type === SelectionType.Card) {
                // Select and render the current card
                await selectAsync(selection.group, selection.card);

                // Render and export the cards into a new zip file
                const zip = await renderCurrentSelection();

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), state.groups[selection.group].cards[selection.card].name);
            } else {
                // Create zip file
                const zip = new JSZip();

                for (let group = 0; group < state.groups.length; group++) {
                    const groupFolder = zip.folder(state.groups[group].name);

                    for (let card = 0; card < state.groups[group].cards.length; card++) {
                        // Select and render the current card
                        await selectAsync(group, card);

                        // Render and export the cards into a new zip file
                        await renderCurrentSelection(groupFolder.folder(state.groups[group].cards[card].name));
                    }
                }

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), "workspace");
            }

            // Return selection
            state.setSelection(preselect);

            // Leave rendering mode
            setIsRendering(false);
        }
    }));

    return (
        <CardContainer>
            <FrontRenderedCallbackContext.Provider value={frontRenderedCallback}>
                <BackRenderedCallbackContext.Provider value={backRenderedCallback}>
                    <CardFront ref={frontRef} />
                    <CardBack ref={backRef} />
                </BackRenderedCallbackContext.Provider>
            </FrontRenderedCallbackContext.Provider >
        </CardContainer >
    );
});

export default RenderedCards;