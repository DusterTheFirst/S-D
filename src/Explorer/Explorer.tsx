/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useObserver } from "mobx-react-lite";
import React, { ChangeEvent, DragEvent, UIEvent, useContext, useState } from "react";
import { MenuItemEventHandler, TriggerEvent } from "react-contexify/lib/types";
import ReactModal from "react-modal";
import CardGroup from "../card/cardGroup";
import { BareSelection, GlobalStateContext, SelectionType } from "../state";
import { DownloadFile, load, textFileReaderAsync } from "../util";
import CardGroupComponent from "./CardGroupComponent";
import { BetterMenuProvider, ExplorerContextMenus } from "./ContextMenu";
import "./Explorer.scss";

export const ModalStyles: { content: React.CSSProperties; overlay: React.CSSProperties } = {
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
/** Highlight the matches to the match string */
export function highlightMatches(text?: string, match?: string) {
    // Only spend time spliting if there is a match to look for
    if (match !== undefined) {
        // Split on higlight term and include term into parts, ignore case
        return text !== undefined ? text.split(new RegExp(`(${match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"))
            .map((part, i) => (
                // If the part is the same as the search term, give it the class highlight
                <span className={part.toLowerCase() === match.toLowerCase() ? "highlight" : ""} key={i}>
                    {part}
                </span>
            )) : null;
    } else {
        return text;
    }
}

/** The args passed to a context menu item when it is clicked */
export interface IItemArgs {
    /** The event that triggered the click */
    event: TriggerEvent;
    /** The props passed to the item */
    props: BareSelection;
}

/** The handler type that react-contextify needs */
export type ItemHandler<T = void> = (info: MenuItemEventHandler) => T;

/** The explorer view */
export default function Explorer() {
    const [search, setSearch] = useState("");
    const [isDragOver, setDragOver] = useState(false);
    const [isTop, setTop] = useState(true);
    const [deleteSelection, setDeleteSelection] = useState<BareSelection>({ type: SelectionType.None });
    const state = useContext(GlobalStateContext);

    // Map the array of groups to arrays of elements
    const groupComponents = useObserver(() => state.getGroups().map((_, i) => <CardGroupComponent key={i} id={i} search={search} />));

    /** Listen for scroll */
    const onScroll = (event: UIEvent<HTMLDivElement>) => {
        if (isTop !== (event.currentTarget.scrollTop === 0)) {
            setTop(event.currentTarget.scrollTop === 0);
        }
    };

    const onDragEnter = () => setDragOver(true);
    const onDragExit = () => setDragOver(false);
    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (deleteSelection.type === SelectionType.None) {
            event.preventDefault();
        }
    };

    const onDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.persist();

        setDragOver(false);

        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            const file = event.dataTransfer.files[i];

            if (file.type === "application/json" || file.name.endsWith(".json")) {
                const contents = await textFileReaderAsync(file);

                load(JSON.parse(contents) as DownloadFile, state);
            } else {
                console.exception(`Format "${file.type}" unrecognised`);
            }
        }

        event.dataTransfer.items.clear();
    };

    const closeDeleteModal = () => setDeleteSelection({ type: SelectionType.None });

    const deleteCard = () => {
        if (deleteSelection.type === SelectionType.Group) {
            state.removeGroup(deleteSelection.group);
        } else if (deleteSelection.type === SelectionType.Card) {
            state.getGroup(deleteSelection.group).removeCard(deleteSelection.card);
        } else {
            console.warn("Attempted to delete card when no card selected for deletion");
        }

        setDeleteSelection({ type: SelectionType.None });
    };

    const addGroup = () => {
        const idx = state.addGroup(new CardGroup(`New Group ${state.groupCount}`));
        state.select(idx);
    };

    const clearSearch = () => setSearch("");
    const updateSearch = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

    return useObserver(() => (
        <div className="explorer">
            {/* Search results */}
            <BetterMenuProvider id="none-contextmenu" selection={{ type: SelectionType.None }}>
                <div className={`children ${isDragOver ? "dragover" : "nodragover"}`} onScroll={onScroll} onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragExit={onDragExit}>
                    {groupComponents}
                </div>
            </BetterMenuProvider>

            {/* Header */}
            <div className={`head ${(isTop ? "top" : "scrolled")}`}>
                <div className="search">
                    <input type="text" onChange={updateSearch} className={search !== "" ? "short" : undefined} value={search} />
                    <div className="x" style={{ display: search !== "" ? undefined : "none" }} onClick={clearSearch}><FontAwesomeIcon icon={faTimes} /></div>
                </div>
                <div className="add" onClick={addGroup}><FontAwesomeIcon icon={faPlus} /></div>
            </div>

            <ExplorerContextMenus setDeleteSelection={setDeleteSelection} />

            <ReactModal isOpen={deleteSelection.type !== SelectionType.None} style={ModalStyles}>
                <div className="modal">
                    <div className="dialog">
                        {/* tslint:disable-next-line: jsx-no-multiline-js jsx-wrap-multiline */}
                        {(() => {
                            if (deleteSelection.type === SelectionType.Group) {
                                const group = state.getGroup(deleteSelection.group);

                                return <span className="info">Are you sure you want to delete the group <span className="name">{group.name}</span> and all of its cards</span>;
                            } else if (deleteSelection.type === SelectionType.Card) {
                                const card = state.getGroup(deleteSelection.group).getCard(deleteSelection.card);

                                return <span className="info">Are you sure you want to delete the card <span className="name">{card.name}</span></span>;
                            } else {
                                return <div className="error">You have reached an invalid state, please press cancel</div>;
                            }
                        })()}
                        <div className="warn">
                            This action is <span className="irreversible">irreversible</span>
                        </div>
                        <div className="buttons">
                            <button onClick={closeDeleteModal}>Cancel</button>
                            <button className="delete" onClick={deleteCard}>Delete</button>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </div>
    ));
}