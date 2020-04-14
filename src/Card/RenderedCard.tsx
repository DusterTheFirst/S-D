/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext } from "react";
import { GlobalStateContext, SelectionType } from "../state";

/** The front face of the card */
export function CardFront() {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        const card = state.selection.type === SelectionType.Card ? state.groups[state.selection.group].cards[state.selection.card] : state.selection.type === SelectionType.Group ? state.groups[state.selection.group].defaults : {};

        const durationConc = card.duration?.toLowerCase().startsWith("concentration ") === true;
        const duration = durationConc ? card.duration?.replace(/^concentration /i, "") : card.duration;
        const durationCap = `${duration?.charAt(0).toUpperCase() ?? ""}${duration?.slice(1) ?? ""}`;

        const cardlevel = parseInt(card.level !== undefined ? card.level : "0", 10);
        const cardType = !isNaN(cardlevel) ? cardlevel === 0 ? `${card.type} cantrip` : `${ordinalSuffixOf(cardlevel)} level ${card.type}` : undefined;

        return (
            <svg className="frontview view" id="cardfrontcanvas" version="1.1" width="50" height="70" viewBox="0 0 50 70" fontFamily="Modesto">
                {/* Frame */}
                <rect width="50" height="70" fill={card.color} />
                <rect width="46" height="64" x="2" y="2" rx="2" ry="2" fill="white" />

                {/* Sections */}
                <line x1="0" y1="9" x2="50" y2="9" stroke={card.color} stroke-width=".3" />
                <line x1="0" y1="16" x2="50" y2="16" stroke={card.color} stroke-width=".3" />
                <line x1="0" y1="23" x2="50" y2="23" stroke={card.color} stroke-width=".3" />
                <line x1="25" y1="9" x2="25" y2="23" stroke={card.color} stroke-width=".3" />

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

                <text fontSize="2" fill="white" x="2.5" y="66.5">
                    <tspan dy="20.8" x="2.5" />
                </text>
                <text fontSize="2" fill="white" x="48" y="68.5" textAnchor="end">{cardType}</text>
            </svg>
        );
    });
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