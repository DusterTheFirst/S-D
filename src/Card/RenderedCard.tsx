/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { createRef, useContext, useEffect } from "react";
import { GlobalStateContext, SelectionType } from "../state";
import { bulletLists, ordinalSuffixOf } from "../util/string";
import { wordWrapSVG } from "../util/wordWrap";

/** The front face of the card */
export function CardFront() {
    const state = useContext(GlobalStateContext);

    // Refs to wrappable words
    const physComponentsRef = createRef<SVGTextElement>();
    const physComponentsBakgroundRef = createRef<SVGRectElement>();
    const descriptionRef = createRef<SVGTextElement>();
    const extDescriptionRef = createRef<SVGTextElement>();
    const extDescriptionTitleRef = createRef<SVGGElement>();

    // Card selection
    const card = useObserver(() => state.selection.type === SelectionType.Card ? state.groups[state.selection.group].cards[state.selection.card] : state.selection.type === SelectionType.Group ? state.groups[state.selection.group].defaults : {});

    // Apply word wrapping to textx
    useEffect(() => {
        // Collecctive hight of blocks
        let currHeight = 0;

        // Aliases for refs
        const physComp = physComponentsRef.current;
        const physCompBkg = physComponentsBakgroundRef.current;
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
        descriptionRef,
        extDescriptionRef,
        extDescriptionTitleRef,
        physComponentsBakgroundRef,
        physComponentsRef
    ]);

    return useObserver(() => {
        const durationConc = card.duration?.toLowerCase().match(/^concentration(,)? /) !== null;
        const duration = durationConc ? card.duration?.replace(/^concentration(,)? /i, "") : card.duration;
        const durationCap = `${duration?.charAt(0).toUpperCase() ?? ""}${duration?.slice(1) ?? ""}`;

        const cardlevel = parseInt(card.level !== undefined ? card.level : "0", 10);
        const cardType = !isNaN(cardlevel) ? cardlevel === 0 ? `${card.type} cantrip` : `${ordinalSuffixOf(cardlevel)} level ${card.type}` : undefined;

        return (
            <svg className="frontview view" width="50" height="70" viewBox="0 0 50 70" fontFamily="Modesto">
                {/* Frame */}
                <rect width="50" height="70" fill={card.color} />
                {/* Background */}
                <rect width="46" height="64" x="2" y="2" rx="2" ry="2" fill="white" />

                {/* Sections */}
                <line x1="0" y1="9" x2="50" y2="9" stroke={card.color} strokeWidth=".3" />
                <line x1="0" y1="16" x2="50" y2="16" stroke={card.color} strokeWidth=".3" />
                <line x1="0" y1="23" x2="50" y2="23" stroke={card.color} strokeWidth=".3" />
                <line x1="25" y1="9" x2="25" y2="23" stroke={card.color} strokeWidth=".3" />

                {/* Title */}
                <text fontFamily="ModestoW01-Expd" textAnchor="middle" fontSize="4" x="25" y="6.75">{card.name}</text>

                {/* Casting Time */}
                <text fontFamily="ModestoW01-Expd" fontSize="2" fill={card.color} x="13.5" y="12" textAnchor="middle">CASTING TIME</text>
                <text fontSize="2" x="13.5" y="14.6" textAnchor="middle">{card.castingTime}</text>

                {/* Range */}
                <text fontFamily="ModestoW01-Expd" fontSize="2" fill={card.color} x="36.5" y="12" textAnchor="middle">RANGE</text>
                <text fontSize="2" x="36.5" y="14.6" textAnchor="middle">{card.range}</text>

                {/* Components */}
                <text fontFamily="ModestoW01-Expd" fontSize="2" fill={card.color} x="13.5" y="19" textAnchor="middle">COMPONENTS</text>
                <text fontSize="2" x="13.5" y="21.6" textAnchor="middle">{card.components}</text>

                {/* Duration */}
                <text fontFamily="ModestoW01-Expd" fontSize="2" fill={card.color} x="36.5" y="19" textAnchor="middle">DURATION</text>
                <text fontSize="2" x="36.5" y="21.6" textAnchor="middle">{durationCap}</text>
                {/* Duration Concentration */}
                <g display={durationConc ? undefined : "none"}>
                    <polygon points="46,17 44,19.5 46,22 48,19.5 46,17" fill={card.color} />
                    <text fontFamily="ModestoW01-Expd" fontSize="2" x="46" y="19.5" dominantBaseline="middle" textAnchor="middle" fill="#ffffff">C</text>
                </g>

                {/* Physical Components */}
                <rect width="50" height="3.5" y="23" fill={card.color} ref={physComponentsBakgroundRef} />
                <text fontSize="2" x="3" y="25.6" ref={physComponentsRef} fill="#ffffff" />
                {/* Description */}
                <text fontSize="2" x="3" y="25.5" ref={descriptionRef} />
                {/* Extended Description */}
                <g ref={extDescriptionTitleRef}>
                    <rect width="50" height="3.5" y="-3" fill={card.color} />
                    <text fontWeight="bold" letterSpacing=".1" y="-.4" fontSize="2" x="25" textAnchor="middle" fill="#ffffff">At Higher Levels</text>
                </g>
                <text fontSize="2" x="3" ref={extDescriptionRef} />

                {/* Card class */}
                <text fontFamily="ModestoW01-Expd" fontSize="2" fill="white" x="2.5" y="68.5">{card.clazz}</text>
                {/* Card type */}
                <text fontSize="2" fill="white" x="48" y="68.5" textAnchor="end">{cardType}</text>
            </svg>
        );
    });
}

/** The back face of the card */
export function CardBack() {
    const state = useContext(GlobalStateContext);

    const card = useObserver(() => state.selection.type === SelectionType.Card ? state.groups[state.selection.group].cards[state.selection.card] : state.selection.type === SelectionType.Group ? state.groups[state.selection.group].defaults : {});

    return useObserver(() => (
        <svg className="backview view" width="50" height="70" viewBox="0 0 50 70" fontFamily="Modesto">
            <rect width="50" height="70" fill={card.color} />
            <rect width="46" height="66" x="2" y="2" rx="2" ry="2" fill="white" />
            <rect width="40" height="60" x="5" y="5" rx="2" ry="2" stroke={card.color} strokeWidth="0.5" fill="transparent" />
            <line x1="5" y1="35" x2="25" y2="5" stroke={card.color} strokeWidth="0.5" />
            <line x1="45" y1="35" x2="25" y2="5" stroke={card.color} strokeWidth="0.5" />
            <line x1="5" y1="35" x2="25" y2="65" stroke={card.color} strokeWidth="0.5" />
            <line x1="45" y1="35" x2="25" y2="65" stroke={card.color} strokeWidth="0.5" />
            <text fontSize="10" fontWeight="bold" fill={card.color} x="37.5" y="15" textAnchor="middle">{card.level}</text>
            <text fontSize="10" fontWeight="bold" fill={card.color} x="12.5" y="62" textAnchor="middle">{card.level}</text>
            <image xlinkHref={card.image} width="25" height="25" x="12.5" y="22.5" />
        </svg>
    ));
}
