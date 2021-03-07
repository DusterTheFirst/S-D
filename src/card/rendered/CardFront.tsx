/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { forwardRef, useContext, useEffect, useRef } from "react";
import { GlobalStateContext, SelectionType } from "../../state";
import { CardText, CardTextInverted, ExpandedText, RenderedCard } from "../../styles/renderedCard";
import { bulletLists, ordinalSuffixOf } from "../../util/string";
import { wordWrapSVG } from "../../util/wordWrap";
import { FrontRenderedCallbackContext } from "./RenderedCards";
import useEmbeddedFont from "./useEmbeddedFont";

/** The front face of the card */
const CardFront = forwardRef<SVGSVGElement>((_, ref) => {
    const state = useContext(GlobalStateContext);

    const rendered = useContext(FrontRenderedCallbackContext);

    // Refs to wrappable words
    const physComponentsRef = useRef<SVGTextElement>(null);
    const physComponentsBackgroundRef = useRef<SVGRectElement>(null);
    const descriptionRef = useRef<SVGTextElement>(null);
    const extDescriptionRef = useRef<SVGTextElement>(null);
    const extDescriptionTitleRef = useRef<SVGGElement>(null);

    // Card selection
    const card = useObserver(() =>
        state.selection.type === SelectionType.Card
            ? state.groups[state.selection.group].cards[state.selection.card]
            : state.selection.type === SelectionType.Group
                ? { name: state.groups[state.selection.group].name, ...state.groups[state.selection.group].defaults }
                : { name: "No Selection" }
    );

    const fonts = useEmbeddedFont();

    // Apply word wrapping to text
    useEffect(() => {
        if (fonts === null) {
            return undefined;
        }
        // Collective hight of blocks
        let currHeight = 0;

        // Aliases for refs
        const physComp = physComponentsRef.current;
        const physCompBkg = physComponentsBackgroundRef.current;
        const desc = descriptionRef.current;
        const extDesc = extDescriptionRef.current;
        const extDescTitle = extDescriptionTitleRef.current;

        if (physCompBkg !== null) {
            if (card.physicalComponents !== undefined && physComp !== null) {
                const height = wordWrapSVG(bulletLists(card.physicalComponents), 44, physComp);

                physCompBkg.setAttribute("height", (height + 4).toString());
                physCompBkg.removeAttribute("display");

                currHeight += height + 3.5;
            } else {
                physCompBkg.setAttribute("display", "none");
            }
        }

        if (card.description !== undefined && desc !== null) {
            desc.setAttribute("dy", currHeight.toString());
            const height = wordWrapSVG(bulletLists(card.description), 44, desc);

            currHeight += height;
        }

        if (extDescTitle !== null) {
            if (card.extDescription !== undefined && extDesc !== null) {
                const height = wordWrapSVG(bulletLists(card.extDescription), 44, extDesc);
                extDesc.setAttribute("y", (65 - height).toString());
                extDescTitle.setAttribute("transform", `translate(0, ${(62 - height)})`);
                extDescTitle.removeAttribute("display");
            } else {
                extDescTitle.setAttribute("display", "none");
            }
        }

        rendered.current();

        return () => {
            if (physComp !== null) {
                physComp.innerHTML = "";
            }
            if (desc !== null) {
                desc.innerHTML = "";
            }
            if (extDesc !== null) {
                extDesc.innerHTML = "";
            }
        };
    }, [
        card,
        rendered,
        descriptionRef,
        extDescriptionRef,
        extDescriptionTitleRef,
        physComponentsBackgroundRef,
        physComponentsRef,
        fonts
    ]);

    return useObserver(() => {
        const durationConc = card.duration !== undefined && card.duration.toLowerCase().match(/^concentration(,)? /) !== null;
        const duration = durationConc ? card.duration?.replace(/^concentration(,)? /i, "") : card.duration;
        const durationCap = `${duration?.charAt(0).toUpperCase() ?? ""}${duration?.slice(1) ?? ""}`;

        const cardType = card.level === undefined ? card.type : card.level === 0 ? `${card.type} cantrip` : `${ordinalSuffixOf(card.level)} level ${card.type}`;

        const color = card.color ?? "#000000";

        return (
            <RenderedCard ref={ref}>
                <defs>
                    <style>{fonts}</style>
                </defs>
                {/* Frame */}
                <rect width="50" height="70" fill={color} />
                {/* Background */}
                <rect width="46" height="64" x="2" y="2" rx="2" ry="2" fill="white" />

                {/* Sections */}
                <line x1="0" y1="9" x2="50" y2="9" stroke={color} strokeWidth=".3" />
                <line x1="0" y1="16" x2="50" y2="16" stroke={color} strokeWidth=".3" />
                <line x1="0" y1="23" x2="50" y2="23" stroke={color} strokeWidth=".3" />
                <line x1="25" y1="9" x2="25" y2="23" stroke={color} strokeWidth=".3" />

                {/* Title */}
                <ExpandedText fill={color} fontSize="4" x="25" y="6.75">{card.name}</ExpandedText>

                {/* Casting Time */}
                <ExpandedText fill={color} x="13.5" y="12">CASTING TIME</ExpandedText>
                <CardText x="13.5" y="14.6">{card.castingTime}</CardText>

                {/* Range */}
                <ExpandedText fill={color} x="36.5" y="12">RANGE</ExpandedText>
                <CardText x="36.5" y="14.6" >{card.range}</CardText>

                {/* Components */}
                <ExpandedText fill={color} x="13.5" y="19" >COMPONENTS</ExpandedText>
                <CardText x="13.5" y="21.6">{card.components}</CardText>

                {/* Duration */}
                <ExpandedText fill={color} x="36.5" y="19" >DURATION</ExpandedText>
                <CardText x="36.5" y="21.6" >{durationCap}</CardText>
                {/* Duration Concentration */}
                <g display={durationConc ? undefined : "none"}>
                    <polygon points="45.5,17 43.5,19.5 45.5,22 47.5,19.5 45.5,17" fill={color} />
                    <ExpandedText x="45.5" y="19.5" dominantBaseline="middle" fill="#ffffff">C</ExpandedText>
                </g>

                {/* Physical Components */}
                <rect width="50" height="3.5" y="23" fill={color} ref={physComponentsBackgroundRef} />
                <CardTextInverted x="3" y="25.6" ref={physComponentsRef} fill="#ffffff" textAnchor="right" />

                {/* Description */}
                <CardText x="3" y="25.5" ref={descriptionRef} textAnchor="right" />

                {/* Extended Description */}
                <g ref={extDescriptionTitleRef}>
                    <rect width="50" height="3.5" y="-3" fill={color} />
                    <ExpandedText letterSpacing=".1" y="-.4" x="25" fill="#ffffff">At Higher Levels</ExpandedText>
                </g>
                <CardText x="3" ref={extDescriptionRef} textAnchor="right" />

                {/* Card class */}
                <ExpandedText fill="white" x="2.5" y="68.5" textAnchor="left">{card.clazz}</ExpandedText>

                {/* Card type */}
                <CardTextInverted fill="white" x="48" y="68.5" textAnchor="end">{cardType}</CardTextInverted>
            </RenderedCard>
        );
    });
});

export default CardFront;