/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import SVG from "svg.js";
import Card from "./card";

/** Render a given card onto the canvas */
export async function renderCard(card: Card) {
    const width = 50;
    const height = 70;

    // Front
    const frontSVG = SVG("cardfrontcanvas").size(width, height);

    // Allow resizing
    frontSVG.viewbox(0, 0, width, height);
    // Border
    frontSVG.rect(width, height).fill({ color: card.color });
    // Background
    frontSVG.rect(width - 4, height - 6).move(2, 2).radius(2).fill("white");
    // Title
    frontSVG.text(card.name !== undefined ? card.name : "Unnamed").size(5).center(width / 2, 5);
    // Seperator
    frontSVG.line(0, 9, width, 9).stroke({ color: card.color, width: 1 });
    // Casting time
    frontSVG.text("CASTING TIME").size(2.5).fill({ color: card.color }).center(width / 4, 11);
    frontSVG.text(card.castingTime !== undefined ? card.castingTime : "").size(2).center(width / 4, 14);
    // Range
    frontSVG.text("RANGE").size(2.5).fill({ color: card.color }).center((width * 3) / 4, 11);
    frontSVG.text(card.range !== undefined ? card.range : "").size(2).center((width * 3) / 4, 14);
    // Seperator
    frontSVG.line(0, 16, width, 16).stroke({ color: card.color, width: 1 });
    // Components
    frontSVG.text("COMPONENTS").size(2.5).fill({ color: card.color }).center(width / 4, 18);
    frontSVG.text(card.components !== undefined ? card.components : "").size(2).center(width / 4, 21);
    // Duration
    frontSVG.text("DURATION").size(2.5).fill({ color: card.color }).center((width * 3) / 4, 18);
    frontSVG.text(card.duration !== undefined ? card.duration : "").size(2).center((width * 3) / 4, 21);
    // Seperator
    frontSVG.line(0, 23, width, 23).stroke({ color: card.color, width: 1 });
    frontSVG.line(width / 2, 9, width / 2, 23).stroke({ color: card.color, width: 1 });
    // Phys Components
    let descriptionOffset = 0;
    if (card.physicalComponents !== undefined) {
        const line = frontSVG.line(0, 24.5, width, 24.5).stroke({ color: card.color });
        const text = frontSVG.text(card.physicalComponents).size(2.5).move(2, 23).fill("white");
        descriptionOffset = text.bbox().height;
        line.stroke({ width: descriptionOffset }).move(0, descriptionOffset / 2 + 23.5);
    }
    // Description
    let extDescrtiptionOffset = 0;
    if (card.description !== undefined) {
        const text = frontSVG.text(card.description).size(2.5).move(2.25, descriptionOffset + 23.5);
        extDescrtiptionOffset = text.bbox().height;
    }
    // Ext Description
    if (card.extDescription !== undefined) {
        frontSVG.text("At Higher Levels:").size(2).font({ weight: "bold" }).move(2.25, descriptionOffset + extDescrtiptionOffset + 24);
        frontSVG.text(card.extDescription).size(2.5).move(2.25, descriptionOffset + extDescrtiptionOffset + 26);
    }
    // Class
    frontSVG.text(card.class !== undefined ? card.class : "").size(2).move(2.5, height - 3.5).fill("white");
    // Type and level
    let tal = "";
    const cardlevel = parseInt(card.level !== undefined ? card.level : "0", 10);
    if (!isNaN(cardlevel)) {
        tal = cardlevel === 0 ? `${card.type} cantrip` : `${ordinalSuffixOf(cardlevel)} level ${card.type}`;
    }
    const rtltext = frontSVG.text(tal).size(2).fill("white");
    rtltext.move(width - rtltext.length() - 2, height - 3.5);

    // Back
    const backSVG = SVG("cardbackcanvas").size(width, height);
    // Alow resixing
    backSVG.viewbox(0, 0, width, height);
    // Border
    backSVG.rect(width, height).attr("fill", card.color);
    // Background
    backSVG.rect(width - 4, height - 4).move(2, 2).radius(2).fill("white");
    // Design
    backSVG.rect(width - 10, height - 10).move(5, 5).radius(2).stroke({ color: card.color, width: 0.5 }).fill("transparent");
    backSVG.line(5, height / 2, width / 2, 5).stroke({ color: card.color, width: 0.5 });
    backSVG.line(width - 5, height / 2, width / 2, 5).stroke({ color: card.color, width: 0.5 });
    backSVG.line(5, height / 2, width / 2, height - 5).stroke({ color: card.color, width: 0.5 });
    backSVG.line(width - 5, height / 2, width / 2, height - 5).stroke({ color: card.color, width: 0.5 });
    // Numbers
    const cardleveltext = card.level !== undefined ? card.level : "0";
    const cardleveloffset = cardleveltext.length === 1 ? 9 : 7;
    const cardlevelsize = cardleveltext.length > 2 ? 7 : 10;
    const num = backSVG.text(cardleveltext).size(cardlevelsize).font({ weight: "bold" }).fill({ color: card.color });
    num.move(width - cardleveloffset - num.length(), 6);
    const num2 = backSVG.text(cardleveltext).size(cardlevelsize).font({ weight: "bold" }).fill({ color: card.color });
    num2.move(cardleveloffset - 1, height - 7 - cardlevelsize);
    // Image
    const image = new Image();
    image.src = `data:image/png;${card.image}`;
    backSVG.image(tint(image, parseColor(card.color !== undefined ? card.color : "")), 20).center(width / 2, height / 2);
}

/** Add a suffix to a number */
function ordinalSuffixOf(i: number) {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) {
        return `${i}st`;
    }
    if (j === 2 && k !== 12) {
        return `${i}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${i}rd`;
    } else {
        return `${i}th`;
    }
}

/** Add a tint to a greyscaled image */
function tint(image: HTMLImageElement, [red, green, blue]: [number, number, number]) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx !== null) {
        const imgWidth = image.width;
        const imgHeight = image.height;
        // You'll get some string error if you fail to specify the dimensions
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        //  alert(imgWidth);
        ctx.drawImage(image, 0, 0);

        // This function cannot be called if the image is not rom the same domain.
        // You'll get security error if you do.
        const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
        const data = imageData.data;

        // This loop gets every pixels on the image and
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg / 255 * red; // red
            data[i + 1] = avg / 255 * green; // green
            data[i + 2] = avg / 255 * blue; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL();
}

/**
 * Copyright 2011 THEtheChad Elliott
 * Released under the MIT and GPL licenses.
 */

// Parse hex/rgb{a} color syntax.
// @input string
// @returns array [r,g,b{,o}]
function parseColor(c: string): [number, number, number] {

    let cache;
    const p = parseInt; // Use p as a byte saving reference to parseInt
    const color = c.replace(/\s\s*/g, ""); // Remove all spaces

    // Checks for 6 digit hex and converts string to integer
    // tslint:disable-next-line:no-conditional-assignment strict-boolean-expressions
    if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)) {
        cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];
    }

    // Checks for 3 digit hex and converts string to integer
    // tslint:disable-next-line:no-conditional-assignment strict-boolean-expressions
    else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)) {
        cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];
    }

    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    // tslint:disable-next-line:no-conditional-assignment strict-boolean-expressions
    else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)) {
        cache = [+cache[1], +cache[2], +cache[3], +cache[4]];
    }

    // Checks for rgb and converts string to
    // integer/float using unary + operator to save bytes
    // tslint:disable-next-line:no-conditional-assignment strict-boolean-expressions
    else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)) {
        cache = [+cache[1], +cache[2], +cache[3]];
    }

    // Otherwise throw an exception to make debugging easier
    else {
        throw Error(`${color} is not supported by parseColor`);
    }

    // Performs RGBA conversion by default
    // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
    isNaN(cache[3]) && (cache[3] = 1);

    // Adds or removes 4th value based on rgba support
    // Support is flipped twice to prevent erros if
    // it's not defined
    // tslint:disable-next-line:binary-expression-operand-order
    return cache.slice(0, 3) as [number, number, number];
}