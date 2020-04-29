/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext } from "react";
import { GlobalStateContext, SelectionType } from "../state";
import { EditorInput, EditorLabel, EditorTitle } from "../styles/editor";
import { GroupSettingsContainer } from "../styles/editor/group";

/** The group settings part */
export default function GroupSettings() {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        if (state.selection.type !== SelectionType.Group) {
            return null;
        }

        const id = state.selection.group;
        const update = (event: React.FormEvent<HTMLInputElement>) => {
            state.groups[id].editName(event.currentTarget.value);
        };

        return (
            <GroupSettingsContainer>
                <EditorTitle>Group settings</EditorTitle>
                <EditorLabel>
                    Name:
                    <EditorInput type="text" value={state.groups[state.selection.group].name ?? ""} onChange={update} />
                </EditorLabel>
            </GroupSettingsContainer>
        );
    });
}
