/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** The styles for the modal */
export const ModalStyles: {
    /** The content props */
    content: React.CSSProperties;
    /** The overlay props */
    overlay: React.CSSProperties;
} = {
    content: {
        background: "#1a1a1a",
        border: "solid 1px #666666",
        color: "#b8b8b8",
        height: "150px",
        left: "50%",
        maxHeight: "calc(100% - 40px)",
        maxWidth: "calc(100% - 40px)",
        minHeight: "100px",
        minWidth: "100px",
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
    },
    overlay: {
        background: "#000000AA"
    }
};

/** The container for the modal */
export const ModalContainer = styled.div`
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto 40px 30px;
    height: 100%;

    grid-column-gap: 10px;

    color: #cccccc;
    font-size: 20px;
`;

/** The dialog for the modal */
export const ModalDialog = styled.div`
    grid-row: 1;
    margin-left: 10px;
`;

/** An emphasis on the modal text */
export const ModalEmph = styled.span`
    font-weight: bold;
    font-style: italic;
`;

/** The description for the modal */
export const ModalDesc = styled.div`
    grid-row: 2;

    margin-left: 10px;
    font-weight: bold;
`;

/** A danger emphasis on modal text */
export const ModalDangerEmph = styled.span`
    color: #f04747;
`;

/** The buttons on a modal */
export const ModalButtons = styled.div`
    grid-row: 3;
    text-align: center;
`;

/** A modal button */
export const ModalButton = styled.button`
    background: #313131;
    border: none;
    color: #cccccc;

    padding: 5px 10px;
    border-radius: 5px;

    margin: 0px 10px;

    &:hover {
        background: #515151;
    }
`;

/** A modal button that represents a dangerous action */
export const ModalDangerButton = styled(ModalButton)`
    color: #f04747;
    font-weight: bold;

    &:hover {
        background: #f04747;
        color: #FFFFFF;
    }
`;

/** A modal button that represents a suggested action */
export const ModalSuggestedButton = styled(ModalButton)`
    color: #17831d;
    font-weight: bold;

    &:hover {
        background: #17831d;
        color: #FFFFFF;
    }
`;