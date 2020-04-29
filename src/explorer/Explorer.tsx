/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Observer } from "mobx-react-lite";
import React, { ChangeEvent, DragEvent, useContext, useState } from "react";
import { MenuItemEventHandler, TriggerEvent } from "react-contexify/lib/types";
import CardGroup from "../card/cardGroup";
import { GlobalStateContext, Selection, SelectionType } from "../state";
import { ExplorerAddButton, ExplorerContainer, ExplorerGroups, ExplorerHeader, ExplorerHighlight, ExplorerSearch, ExplorerSearchX, ExporerSearchInput } from "../styles/explorer";
import { DownloadFile, load, textFileReaderAsync } from "../util/file";
import useIsTop from "../util/useIsTop";
import CardGroupComponent from "./CardGroupComponent";
import { BetterMenuProvider } from "./ContextMenu";

/** Highlight the matches to the match string */
export function highlightMatches(text?: string, match?: string) {
    // Only spend time spliting if there is a match to look for
    if (match !== undefined && match !== "") {
        // Split on higlight term and include term into parts, ignore case
        return text !== undefined && text !== "" ?
            text.split(new RegExp(`(${match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"))
                .map((part, i) => (
                    // If the part is the same as the search term, give it the class highlight
                    part.toLowerCase() === match.toLowerCase() ? (
                        <ExplorerHighlight>
                            {part}
                        </ExplorerHighlight>
                    ) : (
                            <span key={i}>
                                {part}
                            </span>
                        )
                )) : undefined;
    } else {
        return text;
    }
}

/** The args passed to a context menu item when it is clicked */
export interface IItemArgs {
    /** The event that triggered the click */
    event: TriggerEvent;
    /** The props passed to the item */
    props: Selection;
}

/** The handler type that react-contextify needs */
export type ItemHandler<T = void> = (info: MenuItemEventHandler) => T;

/** The explorer view */
export default function Explorer() {
    const [search, setSearch] = useState("");
    const [isDragOver, setDragOver] = useState(false);
    const [isTop, onScroll] = useIsTop();
    const state = useContext(GlobalStateContext);

    const onDragEnter = () => setDragOver(true);
    const onDragExit = () => setDragOver(false);
    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
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
                console.error(`Format "${file.type}" unrecognised`);
            }
        }

        event.dataTransfer.items.clear();
    };

    const clearSearch = () => setSearch("");
    const updateSearch = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

    const addGroup = () => {
        const idx = state.addGroup(new CardGroup(`New Group ${state.groups.length}`));
        state.select(idx);
    };

    return (
        <ExplorerContainer>
            {/* Search results */}
            <BetterMenuProvider id="none-contextmenu" selection={{ type: SelectionType.None }}>
                <ExplorerGroups dragOver={isDragOver} onScroll={onScroll} onDrop={onDrop} onDragEnter={onDragEnter} onDragExit={onDragExit} onDragOver={onDragOver}>
                    <Observer>{() => <>{state.groups.map((_, i) => <CardGroupComponent key={i} id={i} search={search} />)}</>}</Observer>
                </ExplorerGroups>
            </BetterMenuProvider>

            {/* Header */}
            <ExplorerHeader isTop={isTop}>
                <ExplorerSearch>
                    <ExporerSearchInput short={search !== ""} value={search} onChange={updateSearch} />
                    <ExplorerSearchX hidden={search === ""} onClick={clearSearch}>
                        <FontAwesomeIcon icon={faTimes} />
                    </ExplorerSearchX>
                </ExplorerSearch>
                <ExplorerAddButton onClick={addGroup}><FontAwesomeIcon icon={faPlus} /></ExplorerAddButton>
            </ExplorerHeader>
        </ExplorerContainer>
    );
}