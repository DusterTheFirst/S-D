/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

/** Helper to create and load an image async */
export async function createImageAsync(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
}

/** Helper to async create blob from canvas */
export async function canvasToBlobAsync(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((v) => v === null ? reject() : resolve(v), "image/png");
    });
}