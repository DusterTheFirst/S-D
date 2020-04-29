/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** The main app container */
export const AppContainer = styled.div`
    position: absolute;

    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    display: grid;
    grid-template-columns: 250px auto 300px;
    grid-template-rows: 100%;
    grid-column-gap: 3px;

    min-width: 800px;
    height: 100%;
    width: 100%;

    background: #202020;
`;

/** The container for the rendered card views */
export const CardContainer = styled.div`
    grid-column: 3;

    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
`;