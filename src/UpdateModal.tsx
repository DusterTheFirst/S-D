/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React from "react";
import ReactModal from "react-modal";
import { ModalStyles } from "./explorer/Modal";
import "./explorer/Modal.scss";

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
            <div className="modal">
                <div className="dialog">
                    There is a new update! You can choose to update now, or ignore the message.
                </div>
                <div className="buttons">
                    <button className="good" onClick={callDoUpdate(true)}>Update</button>
                    <button onClick={callDoUpdate(false)}>Ignore</button>
                </div>
            </div>
        </ReactModal>
    );
}