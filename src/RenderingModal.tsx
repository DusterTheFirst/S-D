/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React from "react";
import ReactModal from "react-modal";
import { ModalContainer, ModalDangerEmph, ModalDesc, ModalDialog, ModalStyles } from "./styles/modal";

/** The props to the rendering modal */
interface IRenderingModalProps {
    /** If the modal should show */
    show: boolean;
}

/** The delete confirmation modal */
export default function RenderingModal({ show }: IRenderingModalProps) {
    return (
        <ReactModal isOpen={show} style={ModalStyles}>
            <ModalContainer>
                <ModalDialog>
                    A rendering task is taking place
                </ModalDialog>
                <ModalDesc>
                    Please <ModalDangerEmph>DO NOT</ModalDangerEmph> leave the page
                </ModalDesc>
            </ModalContainer>
        </ReactModal>
    );
}