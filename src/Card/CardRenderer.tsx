import * as React from "react";
import Card from "./Card";

export function renderCard(card: Card): IRenderedCard {
    const width = 2000;
    const height = 2800;

    console.info(card);

    let front = <canvas width={width} height={height} ref={frontcanvas => {
        if (frontcanvas !== null) {
            console.info("drawing");

            let ctx = frontcanvas.getContext("2d");

            if (ctx !== null) {
                // Clear
                ctx.clearRect(0, 0, width, height);
                console.info("drawing border");

                // Border
                ctx.save();

                ctx.strokeStyle = card.color === undefined ? "black" : card.color;
                ctx.lineWidth = 100;
                ctx.fillStyle = card.color === undefined ? "black" : card.color;
                roundRect(ctx, 0, 0, width, height, 100);

                ctx.restore();
            }
        }
    }} />;

    let backref = React.createRef<HTMLCanvasElement>();
    let back = <canvas width={width} height={height} ref={backref} />;

    return {
        back, card, front
    };
}

export interface IRenderedCard {
    front: JSX.Element;
    back: JSX.Element;
    card: Card;
}

interface IRadii {
    tl: number;
    tr: number;
    br: number;
    bl: number;
}
type IIRadii = {
    [P in keyof IRadii]?: number;
};
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param x The top left x coordinate
 * @param y The top left y coordinate
 * @param width The width of the rectangle
 * @param height The height of the rectangle
 * @param [radius = 5] The corner radius; It can also be an object
 *                  to specify different radii for corners
 * @param [radius.tl = 0] Top left
 * @param [radius.tr = 0] Top right
 * @param [radius.br = 0] Bottom right
 * @param [radius.bl = 0] Bottom left
 * @param [fill] Whether to fill the rectangle.
 * @param [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | IIRadii = 5, fill = false, stroke = true) {
    let actualradius: IRadii = { tl: 0, tr: 0, br: 0, bl: 0 };
    if (typeof radius === "number") {
        actualradius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        for (let side in radius) {
            actualradius[side] = radius[side];
        }
    }

    ctx.beginPath();

    ctx.moveTo(x + actualradius.tl, y);

    ctx.lineTo(x + width - actualradius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + actualradius.tr);

    ctx.lineTo(x + width, y + height - actualradius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - actualradius.br, y + height);

    ctx.lineTo(x + actualradius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - actualradius.bl);

    ctx.lineTo(x, y + actualradius.tl);
    ctx.quadraticCurveTo(x, y, x + actualradius.tl, y);

    ctx.closePath();

    if (fill) {
        ctx.fill();
    }

    if (stroke) {
        ctx.stroke();
    }

}