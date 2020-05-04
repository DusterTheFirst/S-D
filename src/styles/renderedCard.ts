/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** The view container for the rendered card svg */
export const RenderedCard = styled.svg.attrs({
    fontFamily: "Modesto-Regular",
    height: 700,
    version: "1.1",
    viewBox: "0 0 50 70",
    width: 500,
    xmlns: "http://www.w3.org/2000/svg",
})`
    width: 300px;
    height: calc(300px * 7/5);

    user-select: none;
`;

/** Text for use on a card */
export const CardText = styled.text.attrs(props => ({
    fontSize: props.fontSize ?? 2,
    textAnchor: props.textAnchor ?? "middle"
}))``;

/** Text with the expanded font */
export const ExpandedText = styled(CardText).attrs({
    fontFamily: "Modesto-Expd"
})``;