/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { forwardRef, useContext, useMemo } from "react";
import { GlobalStateContext, SelectionType } from "../../state";
import { RenderedCard } from "../../styles/renderedCard";
import { hashCode } from "../../util/string";
import SVGStyle from "./SVGStyle";

/** The more dynamic part of the card back */
function CardBackDyn() {
    const state = useContext(GlobalStateContext);

    const card = useObserver(() =>
        state.selection.type === SelectionType.Card
            ? state.groups[state.selection.group].cards[state.selection.card]
            : state.selection.type === SelectionType.Group
                ? state.groups[state.selection.group].defaults
                : {}
    );
    const hash = useMemo(() => hashCode(card.image ?? ""), [card.image]);

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
                <text fontSize="10" fontWeight="bold" fill={color} x="38" y="15" textAnchor="middle">{card.level}</text>
                {/* Card level bottom left */}
                <text fontSize="10" fontWeight="bold" fill={color} x="12" y="62" textAnchor="middle">{card.level}</text>

                {/* Card image */}
                <use href={`#${hash}`} />
            </>
        );
    });
}

/** The back face of the card */
const CardBack = forwardRef<SVGSVGElement>((_, ref) => {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        const outImages: {
            [x: string]: string | undefined;
        } = {};

        for (const g of state.groups) {
            for (const c of g.cards) {
                if (c.image !== undefined) {
                    const hashed = hashCode(c.image);
                    if (outImages[hashed] === undefined) {
                        outImages[hashed] = c.image;
                    }
                }
            }
        }

        return (
            <RenderedCard ref={ref}>
                <defs>
                    {Object.entries(outImages).map(([h, image]) => <image key={h} id={h} href={image} width="25" height="25" x="12.5" y="22.5" />)}
                    <SVGStyle />
                </defs>

                <CardBackDyn />
            </RenderedCard>
        );
    });
});

export default CardBack;