/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React from "react";
import ReactModal from "react-modal";
import { ModalStyles } from "./explorer/Modal";
import "./explorer/Modal.scss";
import { UpdateAction } from "./util/useUpdate";

/** The props to the update modal */
interface IUpdateModalProps {
    /** The has to act on */
    hash?: string;
    /** The action to call when a choice is made */
    action(action: UpdateAction, hash: string): void;
}

/** The delete confirmation modal */
export default function UpdateModal({ action, hash }: IUpdateModalProps) {
    const callAction = (actionType: UpdateAction) => () => action(actionType, hash ?? "");

    return (
        <ReactModal isOpen={hash !== undefined} style={ModalStyles}>
            <div className="modal">
                <div className="dialog">
                    There is a new update! Please choose an action below. Ignoring will result in another popup in 10 minutes
                </div>
                <div className="buttons">
                    <button className="good" onClick={callAction(UpdateAction.Update)}>Update</button>
                    <button onClick={callAction(UpdateAction.Ignore)}>Ignore</button>
                    <button className="delete" onClick={callAction(UpdateAction.Skip)}>Skip</button>
                </div>
            </div>
        </ReactModal>
    );
}