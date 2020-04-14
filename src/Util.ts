/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import ICard from "./card/card";
import CardGroup, { ICardGroupData } from "./card/cardGroup";
import { GlobalState, SelectionType } from "./state";

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
export type DownloadFile = {
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
export function download(file: DownloadFile, filename: string) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: "application/json" }));

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 0);
}

/** Helper to laod a file */
export function load(file: DownloadFile, state: GlobalState) {
    if (file.type === SelectionType.None) {
        for (const group of file.data) {
            state.addGroup(CardGroup.fromData(group));
        }
    } else if (file.type === SelectionType.Group) {
        const id = state.addGroup(CardGroup.fromData(file.data));
        state.select(id);
    } else {
        if (state.selection.type === SelectionType.Card || state.selection.type === SelectionType.Group) {
            const id = state.selection.group.value.addCard(file.data);
            state.select(id);
        } else {
            alert("Attempted to add a card when no group is selected")
        }
    }
}