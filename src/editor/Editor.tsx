/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext } from "react";
import { GlobalStateContext, SelectionType } from "../state";
import { EditorCenter, EditorContainer, EditorEmpty } from "../styles/editor";
import CardSettings from "./CardSettings";

/** The editor component */
export default function Editor() {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        if (state.selection.type !== SelectionType.None) {
            return (
                <EditorContainer>
                    <CardSettings />
                </EditorContainer>
            );
        } else {
            return (
                <EditorEmpty>
                    <EditorCenter>You have nothing selected</EditorCenter>
                </EditorEmpty>
            );
        }
    });
}