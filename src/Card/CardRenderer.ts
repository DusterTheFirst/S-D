import * as SVG from "svg.js";
import Card from "./Card";

export async function renderCard(card: Card) {
    const width = 50;
    const height = 70;

    // Front
    let frontSVG = SVG("cardfrontcanvas").size(width, height);

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
        let line = frontSVG.line(0, 24.5, width, 24.5).stroke({ color: card.color });
        let text = frontSVG.text(card.physicalComponents).size(2.5).move(2, 23).fill("white");
        descriptionOffset = text.bbox().height;
        line.stroke({ width: descriptionOffset }).move(0, descriptionOffset / 2 + 23.5);
    }
    // Description
    let extDescrtiptionOffset = 0;
    if (card.description !== undefined) {
        let text = frontSVG.text(card.description).size(2.5).move(2.25, descriptionOffset + 23.5);
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
    let cardlevel = parseInt(card.level !== undefined ? card.level : "0", 10);
    if (!isNaN(cardlevel)) {
        tal = cardlevel === 0 ? `${card.type} cantrip` : `${ordinalSuffixOf(cardlevel)} level ${card.type}`;
    }
    let rtltext = frontSVG.text(tal).size(2).fill("white");
    rtltext.move(width - rtltext.length() - 2, height - 3.5);

    // Back
    let backSVG = SVG("cardbackcanvas").size(width, height);
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
    let cardleveltext = card.level !== undefined ? card.level : "0";
    let cardleveloffset = cardleveltext.length === 1 ? 9 : 7;
    let cardlevelsize = cardleveltext.length > 2 ? 7 : 10;
    let num = backSVG.text(cardleveltext).size(cardlevelsize).font({ weight: "bold" }).fill({ color: card.color });
    num.move(width - cardleveloffset - num.length(), 6);
    let num2 = backSVG.text(cardleveltext).size(cardlevelsize).font({ weight: "bold" }).fill({ color: card.color });
    num2.move(cardleveloffset - 1, height - 7 - cardlevelsize);
    // Image
    let image = new Image();
    image.src = `data:image/png;${card.image}`;
    backSVG.image(grayscale(image), 20).center(width / 2, height / 2);
}

function ordinalSuffixOf(i: number) {
    let j = i % 10;
    let k = i % 100;
    if (j === 1 && k !== 11) {
        return `${i}st`;
    }
    if (j === 2 && k !== 12) {
        return `${i}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${i}rd`;
    }
    return `${i}th`;
}

function grayscale(image: HTMLImageElement) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    if (ctx !== null) {
        let imgWidth = image.width;
        let imgHeight = image.height;
        // You'll get some string error if you fail to specify the dimensions
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        //  alert(imgWidth);
        ctx.drawImage(image, 0, 0);

        // This function cannot be called if the image is not rom the same domain.
        // You'll get security error if you do.
        let imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
        let data = imageData.data;

        // This loop gets every pixels on the image and
        for (let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i]     = 255; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
          }
          ctx.putImageData(imageData, 0, 0);
    }
    return canvas.toDataURL();
}