/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { forwardRef, useContext, useLayoutEffect, useMemo } from "react";
import { IsRenderingContext } from "../../App";
import { GlobalStateContext, SelectionType } from "../../state";
import { RenderedCard } from "../../styles/renderedCard";
import { hashCode } from "../../util/string";
import { BackRenderedCallbackContext } from "./RenderedCards";
import useEmbeddedFont from "./useEmbeddedFont";

/** The more dynamic part of the card back */
function CardBackDyn() {
    const state = useContext(GlobalStateContext);
    const [isRendering] = useContext(IsRenderingContext);

    const rendered = useContext(BackRenderedCallbackContext);

    useLayoutEffect(rendered.current);

    const card = useObserver(() =>
        state.selection.type === SelectionType.Card
            ? state.groups[state.selection.group].cards[state.selection.card]
            : state.selection.type === SelectionType.Group
                ? state.groups[state.selection.group].defaults
                : { name: "No Selection" }
    );
    const hash = useMemo(() => hashCode(card.image ?? ""), [card.image]);

    const cardLevel = card.level === undefined ? card.type?.charAt(0) : card.level;

    return useObserver(() => {
        const color = card.color ?? "#000000";

        return (
            <>
                {/* Frame */}
                <rect width="50" height="70" fill={color} />

                {/* Background */}
                <rect width="46" height="66" x="2" y="2" rx="2" ry="2" fill="white" />

                {/* Rounded line */}
                <rect width="40" height="60" x="5" y="5" rx="2" ry="2" stroke={color} strokeWidth="0.5" fill="transparent" />

                {/* Rhombus */}
                <polyline points="5.25,35 25,5.25 45,34.75 25,64.75 5.25,35" fill="transparent" stroke={color} strokeWidth=".5" />

                {/* Card level top right */}
                <text fontSize="10" fill={color} x="38" y="15" textAnchor="middle">{cardLevel}</text>
                {/* Card level bottom left */}
                <text fontSize="10" fill={color} x="12" y="62" textAnchor="middle">{cardLevel}</text>

                {/* Card image */}
                {isRendering ? <image href={card.image} width="25" height="25" x="12.5" y="22.5" /> : <use href={`#${hash}`} />}
            </>
        );
    });
}

/** A component that contains hidden images to preload them into memory */
function CardImagePreloader() {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        const preloadedImages = new Map<number, JSX.Element>();

        for (const g of state.groups) {
            for (const c of g.cards) {
                if (c.image !== undefined) {
                    const hash = hashCode(c.image);
                    if (!preloadedImages.has(hash)) {
                        preloadedImages.set(hash, <image key={hash} id={hash.toString()} href={c.image} width="25" height="25" x="12.5" y="22.5" />);
                    }
                }
            }
        }

        return <>{Array.from(preloadedImages.values())}</>;
    });
}

/** The back face of the card */
const CardBack = forwardRef<SVGSVGElement>((_, ref) => {
    const [isRendering] = useContext(IsRenderingContext);

    const fonts = useEmbeddedFont();

    return (
        <RenderedCard ref={ref}>
            <defs>
                {isRendering ? null : <CardImagePreloader />}
                <style>{fonts}</style>
            </defs>

            <CardBackDyn />
        </RenderedCard>
    );
});

export default CardBack;