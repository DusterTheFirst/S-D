/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Observer } from "mobx-react-lite";
import React, { useContext } from "react";
import ReactModal from "react-modal";
import { GlobalStateContext, Selection, SelectionType } from "../state";
import { ModalButton, ModalButtons, ModalContainer, ModalDangerButton, ModalDangerEmph, ModalDesc, ModalDialog, ModalEmph, ModalStyles } from "../styles/modal";

/** The props for the delete modal */
interface IDeleteModalProps {
    /** The selection to delete */
    deleteSelection: Selection;
    /** A way to change the selection */
    setDeleteSelection(selection: Selection): void;
}

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

            return <span>Are you sure you want to delete the group <ModalEmph>{group.name}</ModalEmph> and all of its cards</span>;
        } else if (deleteSelection.type === SelectionType.Card) {
            const card = state.groups[deleteSelection.group].cards[deleteSelection.card];

            return <span>Are you sure you want to delete the card <ModalEmph>{card.name}</ModalEmph></span>;
        } else {
            return <span>You have reached an invalid state, please press cancel</span>;
        }
    };

    return (
        <ReactModal isOpen={deleteSelection.type !== SelectionType.None} style={ModalStyles}>
            <ModalContainer>
                <ModalDialog>
                    <Observer>{confirmationMessage}</Observer>
                </ModalDialog>
                <ModalDesc>
                    This action is <ModalDangerEmph>irreversible</ModalDangerEmph>
                </ModalDesc>
                <ModalButtons>
                    <ModalButton onClick={closeDeleteModal}>Cancel</ModalButton>
                    <ModalDangerButton onClick={deleteCard}>Delete</ModalDangerButton>
                </ModalButtons>
            </ModalContainer>
        </ReactModal>
    );
}