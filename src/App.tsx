/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { autorun } from "mobx";
import { create } from "mobx-persist";
import React, { useContext, useEffect, useState } from "react";
import "./App.scss";
import { renderCard } from "./card/cardRenderer";
import { CardFront } from "./card/RenderedCard";
import "./ContextMenu.scss";
import Editor from "./editor/Editor";
import { ExplorerContextMenus } from "./explorer/ContextMenu";
import Explorer from "./explorer/Explorer";
import DeleteModal from "./explorer/Modal";
import { GlobalStateContext, Selection, SelectionType } from "./state";

/**
 * TODO:
 * - Fix svg
 * - Move to hooks
 * - UUID for cards?
 * - Styled components?
 * - Printing (double sided)
 */

// TODO: warn about unsaved before unload
/** The main app component */
export default function App() {
    const state = useContext(GlobalStateContext);

    // MobX setup
    useEffect(() => {
        // Setup Mobx-Persist
        const hydrate = create({
            jsonify: true,
            storage: localStorage
        });

        hydrate("state", state);

        // Card renderer
        return autorun(() => {
            if (state.selection.type === SelectionType.Card) {
                renderCard(state.groups[state.selection.group].cards[state.selection.card]).catch((e) => console.error(e));
            } else if (state.selection.type === SelectionType.Group) {
                renderCard(state.groups[state.selection.group].defaults).catch((e) => console.error(e));
            }
        }, { delay: 15 });
        // eslint-disable-next-line
    }, []);

    const [deleteSelection, setDeleteSelection] = useState<Selection>({ type: SelectionType.None });

    return (
        <div className="app">
            <div className="workspace">
                <Explorer />
                <ExplorerContextMenus setDeleteSelection={setDeleteSelection} />
                <DeleteModal setDeleteSelection={setDeleteSelection} deleteSelection={deleteSelection} />
            </div>
            <div className="settings">
                <Editor />
            </div>
            <div className="renders">
                {/* Create the svg with react, not the extra lib */}
                <svg className="frontview view" id="cardfrontcanvas" />
                <CardFront />
                <svg className="backview view" id="cardbackcanvas" />
            </div>
        </div>
    );
}
