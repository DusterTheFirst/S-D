/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React from "react";
import ReactModal from "react-modal";
import { ModalButton, ModalButtons, ModalContainer, ModalDialog, ModalStyles, ModalSuggestedButton } from "./styles/modal";

/** The props to the update modal */
interface IUpdateModalProps {
    /** The has to act on */
    show: boolean;
    /** The action to call when a choice is made */
    doUpdate(update: boolean): void;
}

/** The delete confirmation modal */
export default function UpdateModal({ doUpdate, show }: IUpdateModalProps) {
    const callDoUpdate = (update: boolean) => () => doUpdate(update);

    return (
        <ReactModal isOpen={show} style={ModalStyles}>
            <ModalContainer>
                <ModalDialog>
                    There is a new update! You can choose to update now, or ignore the message.
                </ModalDialog>
                <ModalButtons>
                    <ModalSuggestedButton onClick={callDoUpdate(true)}>Update</ModalSuggestedButton>
                    <ModalButton onClick={callDoUpdate(false)}>Ignore</ModalButton>
                </ModalButtons>
            </ModalContainer>
        </ReactModal>
    );
}