/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import styled from "styled-components";

/** The container for the editor */
export const EditorContainer = styled.div`
    background: #313131;
    color: #cccccc;

    padding: 15px 10px;

    min-height: calc(100% - 30px);
    overflow: auto;
`;

/** The values section of the editor */
export const EditorValues = styled.div`
    padding-bottom: 20px;
`;

/** The empty editor view */
export const EditorEmpty = styled.div`
    height: 100%;
    width: 100%;
    position: relative;

    color: white;
    background-color: #696969;
`;

/** The centered text in the editor */
export const EditorCenter = styled.div`
    position: absolute;
    top: 50%;
    width: 100%;
    text-align: center;

    transform: translateY(-50%);
`;

/** A title for the editor */
export const EditorTitle = styled.div`
    font-weight: bold;
    font-size: 25px;

    border-bottom: solid 1px #cccccc;
    padding-bottom: 3px;
    margin-bottom: 10px;
`;

/** A label for an editor value */
export const EditorLabel = styled.label`
    font-weight: bold;
    display: block;
    user-select: none;

    &:hover > input,
    &:hover > textarea {
        border-bottom: solid 1px #777777;
    }
`;

/** The editor input for a value */
export const EditorInput = styled.input`
    user-select: contain;

    font-weight: normal;
    background: #00000080;
    color: #cccccc;
    border: solid 1px transparent;

    padding: 2px 5px;

    display: block;

    width: calc(100% - 20px);

    &:focus {
        outline: none;
        border-bottom: solid 1px #cccccc;
    }
`;

/** The editor input for a value */
export const EditorTextArea = styled.textarea`
    user-select: contain;
    resize: none;

    font-weight: normal;
    background: #00000080;
    color: #cccccc;
    border: solid 1px transparent;

    padding: 2px 5px;

    display: block;

    width: calc(100% - 20px);

    &:focus {
        outline: none;
        border-bottom: solid 1px #cccccc;
    }
`;

/** An image in the editor */
export const EditorImage = styled.img`
    max-height: 50px;
    display: block;
`;