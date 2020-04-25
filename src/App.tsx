/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { create } from "mobx-persist";
import React, { useContext, useEffect, useState } from "react";
import "./App.scss";
import { CardBack, CardFront } from "./card/RenderedCard";
import "./ContextMenu.scss";
import Editor from "./editor/Editor";
import { ExplorerContextMenus } from "./explorer/ContextMenu";
import Explorer from "./explorer/Explorer";
import DeleteModal from "./explorer/Modal";
import { GlobalStateContext, Selection, SelectionType } from "./state";
import UpdateModal from "./UpdateModal";
import useUpdate from "./util/useUpdate";

/**
 * TODO:
 * - Better layout
 * - svg image
 * - Styled components?
 * - Printing (double sided)
 */

/** The main app component */
export default function App() {
    const state = useContext(GlobalStateContext);
    const [updateHash, setUpdateHash] = useState<string>();
    const actOnUpdate = useUpdate(setUpdateHash);

    // MobX setup
    useEffect(() => {
        // Setup Mobx-Persist
        const hydrate = create({
            jsonify: true,
            storage: localStorage
        });

        hydrate("state", state);
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
                <CardFront />
                <CardBack />
            </div>
            <UpdateModal action={actOnUpdate} hash={updateHash} />
        </div>
    );
}
