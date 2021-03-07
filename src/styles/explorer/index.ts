/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** The container for the explorer */
export const ExplorerContainer = styled.div`
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 40px calc(100% - 60px);

    grid-column-gap: 10px;

    background: #313131;
    color: #cccccc;

    height: 100%;
    overflow: hidden;
`;

/** Properties for the explorer header */
interface IHeaderProps {
    /** If the view below is scrolled all the way to the top */
    isTop: boolean;
}

/** The header component of the explorer */
export const ExplorerHeader = styled.div<IHeaderProps>`
    grid-row: 1;
    height: 100%;

    padding: 0px 50px;

    margin-left: -50px;

    width: 100%;
    box-shadow: ${props => props.isTop ? "none" : "0px 10px 10px #000000"};
`;

/** The search bar for the explorer */
export const ExplorerSearch = styled.div`
    display: inline-block;
    width: calc(100% - 60px);

    margin: 8px 5px 8px 10px;

    border: 1px solid transparent;

    padding: 0px 3px;

    background: #555555;
`;

/** Properties for the explorer header input */
interface IHeaderSearchInputProps {
    /** If the input should be shortened for the x button */
    short: boolean;
}

/** The input in the explorer search */
export const ExplorerSearchInput = styled.input.attrs({
    type: "text"
}) <IHeaderSearchInputProps>`
    &::-ms-clear {
        display: none;
    }
    outline: none;

    height: 20px;
    width: ${props => props.short ? "calc(100% - 20px)" : "calc(100%)"};

    background: transparent;
    color: #cccccc;
    border: none;

    font-size: 15px;

    padding: 0px;

    display: inline-block;
`;

/** The x button on the explorer */
export const ExplorerSearchX = styled.div`
    height: 20px;
    font-size: 16px;
    width: 20px;

    color: #cccccc;
    text-align: center;
    display: ${props => props.hidden === true ? "none" : "inline-block"};
    position: relative;
    vertical-align: text-bottom;

    user-select: none;

    &:hover {
        color: #f04747;
    }

    svg {
        position: absolute;

        top: 50%;
        left: 50%;

        transform: translate(-50%, -50%);
    }
`;

/** The add button on the explorer */
export const ExplorerAddButton = styled.div`
    color: #cccccc;
    text-align: center;
    display: inline-block;
    position: relative;

    user-select: none;

    width: 20px;
    margin: 0 5px;

    &:hover {
        color: #43b581;
    }
`;

/** The explorer groups section props */
interface IExplorerGroupsProps {
    /** If there is something dragged over */
    dragOver: boolean;
}

/** The groups section of the explorer */
export const ExplorerGroups = styled.div<IExplorerGroupsProps>`
    grid-row: 2;
    user-select: none;

    overflow: auto;
    height: 100%;

    padding: 10px 0px 10px 0px;
    background: ${props => props.dragOver ? "#ec52ec80" : "none"};
`;

/** The highlighted match of the search term */
export const ExplorerHighlight = styled.span`
    background: #ff440041;
`;