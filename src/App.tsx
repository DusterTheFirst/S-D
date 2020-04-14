/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { autorun } from "mobx";
import { create } from "mobx-persist";
import React, { useContext, useEffect } from "react";
import "./App.scss";
import "./ContextMenu.scss";
import Editor from "./editor/Editor";
import Explorer from "./explorer/Explorer";
import { GlobalStateContext, SelectionType } from "./state";

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
    const globalState = useContext(GlobalStateContext);

    // MobX setup
    useEffect(() => {
        // Setup Mobx-Persist
        const hydrate = create({
            jsonify: true,
            storage: localStorage
        });

        hydrate("state", globalState);

        // Card renderer
        return autorun(() => {
            if (globalState.selection.type === SelectionType.Card) {
                // renderCard(globalState.selection.card.filled).catch((e) => console.error(e));
            } else if (globalState.selection.type === SelectionType.Group) {
                // renderCard(globalState.selection.group.value.defaults).catch((e) => console.error(e));
            }
        }, { delay: 15 });
        // eslint-disable-next-line
    }, []);

    return (
        <div className="app">
            <div className="workspace">
                <Explorer />
            </div>
            <div className="settings">
                <Editor />
            </div>
            <div className="renders">
                {/* Create the svg with react, not the extra lib */}
                <svg className="frontview view" id="cardfrontcanvas" />
                <svg className="backview view" id="cardbackcanvas" />
            </div>
        </div>
    );
}
