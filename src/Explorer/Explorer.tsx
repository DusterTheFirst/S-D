/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useObserver } from "mobx-react-lite";
import React, { ChangeEvent, DragEvent, UIEvent, useContext, useState } from "react";
import { Item, Menu, Separator } from "react-contexify";
import { MenuItemEventHandler } from "react-contexify/lib/types";
import ReactModal from "react-modal";
import CardGroup, { ICardGroupData } from "../card/cardGroup";
import { GlobalStateContext, SelectionType, UserSelection } from "../state";
import { textFileReaderAsync } from "../util";
import CardGroupComponent from "./CardGroupComponent";
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

export default function Explorer() {
    const [search, setSearch] = useState("");
    const [isDragOver, setDragOver] = useState(false);
    const [isTop, setTop] = useState(true);
    const [deleteSelection, setDeleteSelection] = useState<UserSelection>({ type: SelectionType.None });
    const state = useContext(GlobalStateContext);

    // Map the array of groups to arrays of elements
    const groupComponents = useObserver(() => state.groups.map((group, i) => <CardGroupComponent key={i} group={group} id={i} search={search} />));

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

                const group = JSON.parse(contents) as ICardGroupData;

                const id = state.addGroup(new CardGroup(group.name, group.defaults, group.cards));
                state.select(id);
            } else {
                console.exception(`Format "${file.type}" unrecognised`);
            }
        }

        event.dataTransfer.items.clear();
    };

    const groupContextDownloadClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const str = JSON.stringify(selectedGroup);

        // if (selectedGroup !== undefined) {
        //     download(new Blob([str], { type: "application/json" }), `${selectedGroup.name}.json`);
        // }
    };

    const groupContextAddClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { addCard, select, selectedGroup } = info.data as ICardController;

        // if (selectedGroup !== undefined) {
        //     addCard(selection.group);
        //     select(selection.group, selectedGroup.getRawCards().length);
        // }
    };

    const groupContextEditClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { select } = info.data as ICardController;

        // select(selection.group, selection.card);
    };

    const contextDeleteClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;

        // this.setState({
        //     deleteModal: {
        //         card: selection.card,
        //         group: selection.group
        //     }
        // });
    };

    const cardContextDuplicateClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { addCard, select, selectedGroup } = info.data as ICardController;

        // if (selectedGroup !== undefined) {
        //     addCard(selection.group, selectedGroup.getRawCard(selection.card));
        //     select(selection.group, selectedGroup.getRawCards().length);
        // }
    };

    const cardContextUpClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { moveCard, select } = info.data as ICardController;

        // moveCard(selection.group, selection.card, selection.card - 1);
        // select(selection.group, selection.card - 1);
    };

    const cardContextDownClick = (info: MenuItemEventHandler) => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { moveCard, select } = info.data as ICardController;

        // moveCard(selection.group, selection.card, selection.card + 1);
        // select(selection.group, selection.card + 1);
    };

    const cardContextUpDisable = (info: MenuItemEventHandler): boolean => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // let { } = info.data as ICardController;

        // return selection.card === 0;

        return true;
    };

    const cardContextDownDisable = (info: MenuItemEventHandler): boolean => {
        console.dir(info);

        // const selection = info.dataFromProvider as ISelection;
        // const { selectedGroup } = info.data as ICardController;

        // if (selectedGroup !== undefined) {
        //     return selection.card === selectedGroup.getRawCards().length - 1;
        // } else {
        //     return true;
        // }

        return true;
    };

    const closeDeleteModal = () => setDeleteSelection({ type: SelectionType.None });

    const deleteCard = () => {
        if (deleteSelection.type === SelectionType.Group) {
            state.removeGroup(deleteSelection.group.id);
        } else if (deleteSelection.type === SelectionType.Card) {
            state.removeCard(deleteSelection.group.id, deleteSelection.card.id);
        } else {
            console.warn("Attempted to delete card when no card selected for deletion");
        }
    };

    const addGroup = () => {
        const idx = state.addGroup(new CardGroup(`New Group ${state.groups.length}`));
        state.select(idx);
    };

    const clearSearch = () => setSearch("");
    const updateSearch = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

    return (
        <div className="explorer">
            {/* Search results */}
            <div className={`children ${isDragOver ? "dragover" : "nodragover"}`} onScroll={onScroll} onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragExit={onDragExit}>
                {groupComponents}

                {/* Group context menu */}
                <Menu id="group-contextmenu">
                    <Item onClick={groupContextEditClick}>Edit</Item>
                    <Item onClick={groupContextAddClick}>Add Card</Item>
                    <Separator />
                    <Item onClick={groupContextDownloadClick}>Download</Item>
                    <Item disabled={true}>Render All</Item>
                    <Item disabled={true}>Print All</Item>
                    <Separator />
                    <Item className="delete" onClick={contextDeleteClick}>Delete</Item>
                </Menu>

                {/* Card context menu */}
                <Menu id="card-contextmenu">
                    <Item onClick={cardContextDuplicateClick}>Duplicate</Item>
                    <Separator />
                    <Item onClick={cardContextUpClick} disabled={cardContextUpDisable}>Move Up</Item>
                    <Item onClick={cardContextDownClick} disabled={cardContextDownDisable}>Move Down</Item>
                    <Separator />
                    <Item className="delete" onClick={contextDeleteClick}>Delete</Item>
                </Menu>

                <ReactModal isOpen={deleteSelection.type !== SelectionType.None} style={ModalStyles}>
                    <div className="modal">{/* {(() => {
                        if (this.state.deleteModal === undefined) {
                            return (
                                <div className="error">
                                    You really messed up if you can see this
                                </div>
                            );
                        }

                        const cardid = this.state.deleteModal.card;
                        const groupid = this.state.deleteModal.group;

                        const group = cards.groups[groupid];

                        if (group !== undefined) {
                            const card = group.getCard(cardid);

                            return (
                                <div className="dialog">
                                    Are you sure you want to delete
                                    {
                                        cardid !== -1
                                            ? <span className="info"> <span className="type">card</span> <span className="name">{card.name}</span></span>
                                            : <span className="info"> <span className="type">group</span> <span className="name">{group.name}</span> and all of its cards</span>
                                    }
                                                ?
                                </div>
                            );
                        } else {
                            return (
                                <div className="error">
                                    You really messed up if you can see this
                                </div>
                            );
                        }
                    })()} */}
                        <div className="warn">
                            This action is <span className="irreversible">irreversible</span>
                        </div>
                        <div className="buttons">
                            <button onClick={closeDeleteModal}>Cancel</button>
                            <button className="delete" onClick={deleteCard}>Delete</button>
                        </div>
                    </div>
                </ReactModal>
            </div>
            {/* Header */}
            <div className={`head ${(isTop ? "top" : "scrolled")}`}>
                <div className="search">
                    <input type="text" onChange={updateSearch} className={search !== "" ? "short" : undefined} value={search} />
                    <div className="x" style={{ display: search !== "" ? undefined : "none" }} onClick={clearSearch}><FontAwesomeIcon icon={faTimes} /></div>
                </div>
                <div className="add" onClick={addGroup}><FontAwesomeIcon icon={faPlus} /></div>
            </div>
        </div>
    );
}