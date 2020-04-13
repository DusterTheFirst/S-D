/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { create } from "mobx-persist";
import React, { useContext, useEffect, useLayoutEffect } from "react";
import "./App.css";
import { renderCard } from "./card/cardRenderer";
import "./ContextMenu.css";
import Editor from "./editor/Editor";
import Explorer from "./Explorer/Explorer";
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
    }, []);

    // Card renderer
    useLayoutEffect(() => {
        if (globalState.selectionValue.type === SelectionType.Card) {
            renderCard(globalState.selectionValue.card.filled).catch((e) => console.error(e));
        } else if (globalState.selectionValue.type === SelectionType.Group) {
            renderCard(globalState.selectionValue.group.metadata.defaults).catch((e) => console.error(e));
        }
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
