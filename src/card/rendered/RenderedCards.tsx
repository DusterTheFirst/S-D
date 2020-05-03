/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import JSZip from "jszip";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { CardContainer } from "../../styles/app";
import { canvasToBlobAsync, createImageAsync } from "../../util/image";
import CardBack from "./CardBack";
import CardFront from "./CardFront";

/** The width of the resulting rasters */
const RASTER_WIDTH = 1500;
/** The height of the resulting rasters */
const RASTER_HEIGHT = 2100;

/** The ref exposed by thr Rendered Cards component */
export interface IRenderedCardsRef {
    /** Render/Rasterize the cards */
    render(zip?: JSZip): Promise<JSZip>;
}

/** The rendered cards container and manager */
const RenderedCards = forwardRef<IRenderedCardsRef>((_, ref) => {
    const frontRef = useRef<SVGSVGElement>(null);
    const backRef = useRef<SVGSVGElement>(null);

    useImperativeHandle<IRenderedCardsRef, IRenderedCardsRef>(ref, () => ({
        render: async (zip = new JSZip()) => {
            // Make sure the svgs are actually rendered
            if (frontRef.current === null || backRef.current === null) {
                throw new ReferenceError("Attempted to render while the card was not rendered, please try again.");
            }

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

            // Setup exportable svg for the sides
            const svgFront = `<?xml version="1.0" encoding="utf-8"?>${frontRef.current.outerHTML}`;
            const svgBack = `<?xml version="1.0" encoding="utf-8"?>${backRef.current.outerHTML}`;

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