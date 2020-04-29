/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";
import { ISelectableProps } from "./cardGroup";

/** The title to the card group */
export const CardTitle = styled.div<ISelectableProps>`
    min-height: 20px;
    background: ${props => props.selected ? "#515151" : "none"};

    &:hover {
        background: #414141;
    }

    padding: 3px 0px 3px 30px;
`;