/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { create } from "mobx-persist";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import RenderedCards, { IRenderedCardsRef } from "./card/rendered/RenderedCards";
import Editor from "./editor/Editor";
import { ExplorerContextMenus } from "./explorer/ContextMenu";
import DeleteModal from "./explorer/DeleteModal";
import Explorer from "./explorer/Explorer";
import register from "./registerServiceWorker";
import RenderingModal from "./RenderingModal";
import { GlobalStateContext, Selection, SelectionType } from "./state";
import { AppContainer } from "./styles/app";
import { ContextMenuStyles } from "./styles/contextMenu";
import GlobalStyles from "./styles/global";
import UpdateModal from "./UpdateModal";

/**
 * TODO:
 * - Better layout
 * - Printing (double sided)
 */

/** The context for the rendered cards component */
export const RenderedCardsContext = createContext<React.RefObject<IRenderedCardsRef>>({ current: null });
/** The context for the rendering state */
export const IsRenderingContext = createContext<[boolean, (value: boolean) => void]>([false, () => void 0]);

/** The main app component */
export default function App() {
    const state = useContext(GlobalStateContext);

    const [isRendering, setIsRendering] = useState(false);

    const cardsRef = useRef<IRenderedCardsRef>(null);

    // Updates
    const [updateAvaliable, setUpdateAvaliable] = useState(false);
    const doUpdate = (update: boolean) => {
        if (update) {
            console.log("%cUser accepting update, reloading", "color: goldenrod");
            location.reload(); // eslint-disable-line
        } else {
            console.log("%cUser ignored update", "color: goldenrod");
        }

        // Hide prompt
        setUpdateAvaliable(false);
    };

    useEffect(() => {
        // Setup Mobx-Persist
        const hydrate = create({
            jsonify: true,
            storage: localStorage
        });

        hydrate("state", state);

        // Setup service worker
        register(setUpdateAvaliable);

        // Disable context menu
        document.oncontextmenu = (e) => {
            e.preventDefault();
        };
        // eslint-disable-next-line
    }, []);

    const [deleteSelection, setDeleteSelection] = useState<Selection>({ type: SelectionType.None });

    return (
        <AppContainer>
            <RenderedCardsContext.Provider value={cardsRef}>
                <IsRenderingContext.Provider value={[isRendering, setIsRendering]}>
                    {/* Global styles */}
                    <GlobalStyles />
                    <ContextMenuStyles />

                    {/* The exporer view */}
                    <Explorer />
                    <ExplorerContextMenus setDeleteSelection={setDeleteSelection} />
                    <DeleteModal setDeleteSelection={setDeleteSelection} deleteSelection={deleteSelection} />

                    {/* The editor */}
                    <Editor />

                    {/* The card renders */}
                    <RenderedCards ref={cardsRef} />

                    {/* The update modal */}
                    <UpdateModal doUpdate={doUpdate} show={updateAvaliable} />

                    {/* The rendering modal */}
                    <RenderingModal show={isRendering} />
                </IsRenderingContext.Provider>
            </RenderedCardsContext.Provider>
        </AppContainer>
    );
}
