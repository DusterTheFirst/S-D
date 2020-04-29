/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** Props for a component that is selectable */
export interface ISelectableProps {
    /** If the component is selected */
    selected: boolean;
}

/** The title to the card group */
export const CardGroupTitle = styled.div<ISelectableProps>`
    padding: 0px 0px 0px 10px;
    background: ${props => props.selected ? "#2b5c3b" : "none"};

    &:hover {
        background: #414141;
    }
`;

/** The carat for the card group */
export const CardGroupCaret = styled.div`
    display: inline-block;
    width: 20px;
    text-align: center;
`;

/** The name for the group */
export const CardGroupName = styled.div`
    display: inline-block;
    font-weight: bold;
    font-size: 20px;
`;