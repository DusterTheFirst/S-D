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
import { doubleSideOrdering, foldableOrdering } from "./cardOrdering";

/** The width of the resulting rasters */
const RASTER_WIDTH = 1500;
/** The height of the resulting rasters */
const RASTER_HEIGHT = 2100;

/** The ref exposed by thr Rendered Cards component */
export interface IRenderedCardsRef {
    /** Render/Rasterize the card */
    render(selection: Selection): Promise<void>;
    /** Print the card in a double sided arrangement */
    printDoubleSided(selection: Selection): Promise<void>;
    /** Print the card in a foldable arrangement */
    printFoldable(selection: Selection): Promise<void>;
}

/** The rendered callback context for the front of the card */
export const FrontRenderedCallbackContext = createContext<MutableRefObject<() => void>>({ current: () => void 0 });
/** The rendered callback context for the back of the card */
export const BackRenderedCallbackContext = createContext<MutableRefObject<() => void>>({ current: () => void 0 });

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
            fetch("/fonts/Modesto-Regular.ttf").then(x => x.blob()).then(dataFileReaderAsync),
            fetch("/fonts/OpenSans-Regular.ttf").then(x => x.blob()).then(dataFileReaderAsync),
            fetch("/fonts/OpenSans-SemiBold.ttf").then(x => x.blob()).then(dataFileReaderAsync)
        ]).then(([expd, regular, sans, sansSemi]) => {
            pdfMake.vfs = {
                "Modesto-Expd.ttf": expd.substring(expd.lastIndexOf(",") + 1),
                "Modesto-Regular.ttf": regular.substring(regular.lastIndexOf(",") + 1),
                "OpenSans-Regular.ttf": sans.substring(sans.lastIndexOf(",") + 1),
                "OpenSans-SemiBold.ttf": sansSemi.substring(sansSemi.lastIndexOf(",") + 1)
            };
            pdfMake.fonts = {
                "Modesto-Expd": {
                    normal: "Modesto-Expd.ttf"
                },
                "Modesto-Regular": {
                    normal: "Modesto-Regular.ttf"
                },
                "Open Sans": {
                    normal: "OpenSans-Regular.ttf"
                },
                "Open Sans SemiBold": {
                    normal: "OpenSans-SemiBold.ttf",
                }
            };
        }).catch(e => console.error(e));
    }, []);

    const selectAsync = useCallback((...args: Parameters<GlobalState["select"]>) => Promise.race([
        new Promise((resolve) => {
            frontRenderedCallback.current = () => {
                frontRenderedCallback.current = () => void 0;
                backRenderedCallback.current = () => void 0;
                resolve(undefined);
            };

            state.select(...args);
        }),
        new Promise((resolve) => {
            backRenderedCallback.current = () => {
                frontRenderedCallback.current = () => void 0;
                backRenderedCallback.current = () => void 0;
                resolve(undefined);
            };
        }),
        new Promise((resolve) => setTimeout(() => resolve(undefined), 1000))
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

    const print = useCallback((ordering: (cards: Array<[string, string]>) => Content) => async (selection: Selection) => {
        // Move into rendering mode
        setIsRendering(true);

        // Save the previous selection
        const preselect = state.selection;

        if (selection.type === SelectionType.Group) {
            const svgs: Array<[string, string]> = [];

            for (let card = 0; card < state.groups[selection.group].cards.length; card++) {
                // Select and render the current card
                await selectAsync(selection.group, card);

                const currentSvgs = getCurrentSelectedSVGs();

                svgs.push(currentSvgs);
            }

            pdfMake.createPdf({
                content: ordering(svgs),
                pageMargins: 0,
                pageSize: "LETTER",
            }).print();
        } else if (selection.type === SelectionType.Card) {
            // Select and render the current card
            await selectAsync(selection.group, selection.card);

            // Make a simple pdf of one side of the card on each page
            pdfMake.createPdf({
                content: ordering([getCurrentSelectedSVGs()]),
                pageMargins: 0,
                pageSize: "LETTER",
            }).print();
        } else {
            const svgs: Array<[string, string]> = [];

            for (let group = 0; group < state.groups.length; group++) {
                for (let card = 0; card < state.groups[group].cards.length; card++) {
                    // Select and render the current card
                    await selectAsync(group, card);

                    const currentSvgs = getCurrentSelectedSVGs();

                    svgs.push(currentSvgs);
                }
            }

            pdfMake.createPdf({
                content: ordering(svgs),
                pageMargins: 0,
                pageSize: "LETTER",
            }).print();
        }

        // Return selection
        state.setSelection(preselect);

        // Leave rendering mode
        setIsRendering(false);
    }, [getCurrentSelectedSVGs, selectAsync, setIsRendering, state]);

    useImperativeHandle<IRenderedCardsRef, IRenderedCardsRef>(ref, () => ({
        printDoubleSided: print(doubleSideOrdering),
        printFoldable: print(foldableOrdering),
        render: async (selection: Selection) => {
            // Move into rendering mode
            setIsRendering(true);

            // Save the previous selection
            const preselect = state.selection;

            if (selection.type === SelectionType.Group) {
                // Create zip file
                const zip = new JSZip();

                const cardCount = state.groups[selection.group].cards.length;
                const cardCountWidth = cardCount.toString(10).length;
                for (let card = 0; card < cardCount; card++) {
                    // Select and render the current card
                    await selectAsync(selection.group, card);

                    // Safe to assert as non null since the card # is used as a uuid
                    // tslint:disable-next-line: no-non-null-assertion
                    const folder = zip.folder(`${card.toString(10).padStart(cardCountWidth, "0")}-${state.groups[selection.group].cards[card].name}`)!;

                    // Render and export the cards into a new zip file
                    await renderCurrentSelection(folder);
                }

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), `${state.groups[selection.group].name}.zip`);
            } else if (selection.type === SelectionType.Card) {
                // Select and render the current card
                await selectAsync(selection.group, selection.card);

                // Render and export the cards into a new zip file
                const zip = await renderCurrentSelection();

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), `${state.groups[selection.group].cards[selection.card].name}.zip`);
            } else {
                // Create zip file
                const zip = new JSZip();

                const groupCount = state.groups.length;
                const groupCountWidth = groupCount.toString(10).length;
                for (let group = 0; group < groupCount; group++) {
                    // Safe to assert as non null since the card # is used as a uuid
                    // tslint:disable-next-line: no-non-null-assertion
                    const groupFolder = zip.folder(`${group.toString(10).padStart(groupCountWidth, "0")}-${state.groups[group].name}`)!;

                    const cardCount = state.groups[group].cards.length;
                    const cardCountWidth = cardCount.toString(10).length;
                    for (let card = 0; card < cardCount; card++) {
                        // Select and render the current card
                        await selectAsync(group, card);

                        // Safe to assert as non null since the card # is used as a uuid
                        // tslint:disable-next-line: no-non-null-assertion
                        const folder = groupFolder.folder(`${card.toString(10).padStart(cardCountWidth, "0")}-${state.groups[group].cards[card].name}`)!;

                        // Render and export the cards into a new zip file
                        await renderCurrentSelection(folder);
                    }
                }

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), "workspace.zip");
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