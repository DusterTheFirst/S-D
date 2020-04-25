/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Observer } from "mobx-react-lite";
import React, { useContext } from "react";
import ReactModal from "react-modal";
import { GlobalStateContext, Selection, SelectionType } from "../state";
import "./Modal.scss";

/** The props for the delete modal */
interface IDeleteModalProps {
    /** The selection to delete */
    deleteSelection: Selection;
    /** A way to change the selection */
    setDeleteSelection(selection: Selection): void;
}

/** The styles for the modal */
export const ModalStyles: {
    /** The content props */
    content: React.CSSProperties;
    /** The overlay props */
    overlay: React.CSSProperties;
} = {
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

/** The delete confirmation modal */
export default function DeleteModal({ deleteSelection, setDeleteSelection }: IDeleteModalProps) {
    const state = useContext(GlobalStateContext);

    const deleteCard = () => {
        if (deleteSelection.type === SelectionType.Group) {
            state.select();
            state.removeGroup(deleteSelection.group);
        } else if (deleteSelection.type === SelectionType.Card) {
            state.select(deleteSelection.group);
            state.groups[deleteSelection.group].removeCard(deleteSelection.card);
        } else {
            console.warn("Attempted to delete card when no card selected for deletion");
        }

        setDeleteSelection({ type: SelectionType.None });
    };
    const closeDeleteModal = () => setDeleteSelection({ type: SelectionType.None });

    const confirmationMessage = () => {
        if (deleteSelection.type === SelectionType.Group) {
            const group = state.groups[deleteSelection.group];

            return <span className="info">Are you sure you want to delete the group <span className="name">{group.name}</span> and all of its cards</span>;
        } else if (deleteSelection.type === SelectionType.Card) {
            const card = state.groups[deleteSelection.group].cards[deleteSelection.card];

            return <span className="info">Are you sure you want to delete the card <span className="name">{card.name}</span></span>;
        } else {
            return <div className="error">You have reached an invalid state, please press cancel</div>;
        }
    };

    return (
        <ReactModal isOpen={deleteSelection.type !== SelectionType.None} style={ModalStyles}>
            <div className="modal">
                <div className="dialog">
                    <Observer>{confirmationMessage}</Observer>
                </div>
                <div className="warn">
                    This action is <span className="irreversible">irreversible</span>
                </div>
                <div className="buttons">
                    <button onClick={closeDeleteModal}>Cancel</button>
                    <button className="delete" onClick={deleteCard}>Delete</button>
                </div>
            </div>
        </ReactModal>
    );
}