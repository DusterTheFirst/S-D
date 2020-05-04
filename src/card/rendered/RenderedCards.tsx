/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { IsRenderingContext } from "../../App";
import { GlobalStateContext, Selection, SelectionType } from "../../state";
import { CardContainer } from "../../styles/app";
import { dataFileReaderAsync } from "../../util/file";
import { canvasToBlobAsync, createImageAsync } from "../../util/image";
import CardBack from "./CardBack";
import CardFront from "./CardFront";

/** The width of the resulting rasters */
const RASTER_WIDTH = 1500;
/** The height of the resulting rasters */
const RASTER_HEIGHT = 2100;

console.dir(pdfFonts.pdfMake.vfs);

/** The ref exposed by thr Rendered Cards component */
export interface IRenderedCardsRef {
    /** Render/Rasterize the card */
    render(selection: Selection): Promise<void>;
    /** Print the card */
    print(selection: Selection): Promise<void>;
}

/** The rendered cards container and manager */
const RenderedCards = forwardRef<IRenderedCardsRef>((_, ref) => {
    const frontRef = useRef<SVGSVGElement>(null);
    const backRef = useRef<SVGSVGElement>(null);

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

            console.dir(pdfMake.vfs, pdfMake.fonts);
        }).catch(e => console.error(e));
    }, []);

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
        print: async (selection: Selection) => {
            // Move into rendering mode
            setIsRendering(true);

            // Save the previous selection
            const preselect = state.selection;

            if (selection.type === SelectionType.Group) { }
            else if (selection.type === SelectionType.Card) {
                // Select and render the current card
                state.select(selection.group, selection.card);

                const [svgFront, svgBack] = getCurrentSelectedSVGs();

                // x = 612
                // y = 792

                pdfMake.createPdf({
                    content: [
                        {
                            height: 280,
                            svg: svgFront,
                            width: 200
                        },
                        {
                            height: 280,
                            pageBreak: "before",
                            style: {
                                alignment: "right"
                            },
                            svg: svgBack,
                            width: 200,
                        }
                    ],
                    pageMargins: 0,
                    pageSize: "LETTER",
                }).print();
            } else { }

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
                    state.select(selection.group, card);

                    // Render and export the cards into a new zip file
                    await renderCurrentSelection(zip.folder(state.groups[selection.group].cards[card].name));
                }

                // Save the zip file
                saveAs(await zip.generateAsync({ type: "blob" }), state.groups[selection.group].name);
            } else if (selection.type === SelectionType.Card) {
                // Select and render the current card
                state.select(selection.group, selection.card);

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
                        state.select(group, card);

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
            <CardFront ref={frontRef} />
            <CardBack ref={backRef} />
        </CardContainer>
    );
});

export default RenderedCards;