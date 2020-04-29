/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { create } from "mobx-persist";
import React, { useContext, useEffect, useState } from "react";
import { CardBack, CardFront } from "./card/RenderedCard";
import Editor from "./editor/Editor";
import { ExplorerContextMenus } from "./explorer/ContextMenu";
import Explorer from "./explorer/Explorer";
import DeleteModal from "./explorer/Modal";
import register from "./registerServiceWorker";
import { GlobalStateContext, Selection, SelectionType } from "./state";
import { AppContainer, CardContainer } from "./styles/app";
import { ContextMenuStyles } from "./styles/contextMenu";
import GlobalStyles from "./styles/global";
import UpdateModal from "./UpdateModal";

/**
 * TODO:
 * - Better layout
 * - Styled components?
 * - Printing (double sided)
 */

/** The main app component */
export default function App() {
    const state = useContext(GlobalStateContext);
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
            <CardContainer>
                <CardFront />
                <CardBack />
            </CardContainer>

            {/* The update modal */}
            <UpdateModal doUpdate={doUpdate} show={updateAvaliable} />
        </AppContainer>
    );
}
