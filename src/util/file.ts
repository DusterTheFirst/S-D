/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { saveAs } from "file-saver";
import ICard from "../card/card";
import CardGroup, { ICardGroupData } from "../card/cardGroup";
import { GlobalState, SelectionType } from "../state";

/** Helper to create a file reader that is async and reads text */
export async function textFileReaderAsync(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (_) => {
            if (reader.result !== null) {
                resolve(reader.result.toString());
            } else {
                reject(new Error("No result"));
            }
        };
        reader.onerror = reject;
    });
}

/** Helper that can create a file reaer that is async and reads data */
export async function dataFileReaderAsync(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_) => {
            if (reader.result !== null) {
                resolve(reader.result.toString());
            } else {
                reject(new Error("No result"));
            }
        };
        reader.onerror = reject;
    });
}

/** The structure for a downloaded file */
export type DownloadSelection = {
    /** The type of selection */
    type: SelectionType.None;
    /** All groups */
    data: ICardGroupData[];
} | {
    /** The type of selection */
    type: SelectionType.Group;
    /** The group */
    data: ICardGroupData;
} | {
    /** The type of selection */
    type: SelectionType.Card;
    /** The card */
    data: ICard;
};

/** Helper to download a file */
export function downloadSelection(file: DownloadSelection, filename: string) {
    saveAs(new Blob([JSON.stringify(file)], { type: "application/json" }), filename);
}

/** Helper to laod a file */
export function loadSelection(file: DownloadSelection, state: GlobalState) {
    if (file.type === SelectionType.None) {
        for (const group of file.data) {
            state.addGroup(CardGroup.fromData(group));
        }
    } else if (file.type === SelectionType.Group) {
        const id = state.addGroup(CardGroup.fromData(file.data));
        state.select(id);
    } else {
        if (state.selection.type === SelectionType.Card || state.selection.type === SelectionType.Group) {
            const id = state.groups[state.selection.group].addCard(file.data);
            state.select(state.selection.group, id);
        } else {
            alert("Attempted to add a card when no group is selected");
        }
    }
}