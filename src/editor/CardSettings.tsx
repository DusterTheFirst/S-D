/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { useContext, useRef } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import { EditorImage, EditorInput, EditorLabel, EditorTitle, EditorValues } from "../styles/editor";
import { dataFileReaderAsync } from "../util/file";
import AutoResizeTextArea from "./AutoResizeTextArea";
import GroupSettings from "./GroupSettings";

/** The CardSettings section */
export default function CardSettings() {
    const state = useContext(GlobalStateContext);
    const imageRef = useRef<HTMLInputElement>(null);

    return useObserver(() => {
        const cardSettings = state.selection.type === SelectionType.Card ? state.groups[state.selection.group].rawCards[state.selection.card] : state.selection.type === SelectionType.Group ? state.groups[state.selection.group].defaults : {};
        const placeholders = state.selection.type === SelectionType.Card ? state.groups[state.selection.group].defaults : undefined;

        /** Update the internal cache values of a text value */
        const cardValueUpdater = (name: keyof ICard) => {
            return (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                event.persist();

                if (state.selection.type === SelectionType.Card) {
                    state.groups[state.selection.group].editCard(state.selection.card, name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
                } else if (state.selection.type === SelectionType.Group) {
                    state.groups[state.selection.group].editDefaults(name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
                }
            };
        };

        const clear = (param: keyof ICard) => () => {
            if (state.selection.type === SelectionType.Card) {
                state.groups[state.selection.group].editCard(state.selection.card, param, undefined);
            } else if (state.selection.type === SelectionType.Group) {
                state.groups[state.selection.group].editDefaults(param, undefined);
            }
        };

        const fileInput = async (event: React.FormEvent<HTMLInputElement>) => {
            event.persist();

            if (state.selection.type === SelectionType.Card) {
                if (imageRef.current !== null) {
                    let image: string | undefined;

                    if (imageRef.current.files !== null) {
                        image = await dataFileReaderAsync(imageRef.current.files[0]);
                    }

                    state.groups[state.selection.group].editCard(state.selection.card, "image", image);
                }
            } else if (state.selection.type === SelectionType.Group) {
                if (imageRef.current !== null) {
                    let image: string | undefined;

                    if (imageRef.current.files !== null) {
                        image = await dataFileReaderAsync(imageRef.current.files[0]);
                    }

                    state.groups[state.selection.group].editDefaults("image", image);
                }
            }
        };

        return (
            <EditorValues>
                <GroupSettings />
                <EditorTitle>Card Settings</EditorTitle>
                <EditorLabel>
                    Name:
                    <EditorInput type="text" value={cardSettings.name ?? ""} onChange={cardValueUpdater("name")} placeholder={placeholders?.name} />
                </EditorLabel>
                <EditorLabel>
                    Casting Time:
                    <EditorInput type="text" value={cardSettings.castingTime ?? ""} onChange={cardValueUpdater("castingTime")} placeholder={placeholders?.castingTime} />
                </EditorLabel>
                <EditorLabel>
                    Range:
                    <EditorInput type="text" value={cardSettings.range ?? ""} onChange={cardValueUpdater("range")} placeholder={placeholders?.range} />
                </EditorLabel>
                <EditorLabel>
                    Components:
                    <EditorInput type="text" value={cardSettings.components ?? ""} onChange={cardValueUpdater("components")} placeholder={placeholders?.components ?? ""} />
                </EditorLabel>
                <EditorLabel>
                    Duration:
                    <EditorInput type="text" value={cardSettings.duration ?? ""} onChange={cardValueUpdater("duration")} placeholder={placeholders?.duration} />
                </EditorLabel>
                <EditorLabel>
                    Physical Components:
                    <AutoResizeTextArea value={cardSettings.physicalComponents ?? ""} onChange={cardValueUpdater("physicalComponents")} placeholder={placeholders?.physicalComponents} />
                </EditorLabel>
                <EditorLabel>
                    Description:
                    <AutoResizeTextArea value={cardSettings.description ?? ""} onChange={cardValueUpdater("description")} placeholder={placeholders?.description} />
                </EditorLabel>
                <EditorLabel>
                    Extended Description:
                    <AutoResizeTextArea value={cardSettings.extDescription ?? ""} onChange={cardValueUpdater("extDescription")} placeholder={placeholders?.extDescription} />
                </EditorLabel>
                <EditorLabel>
                    Class:
                    <EditorInput type="text" value={cardSettings.clazz ?? ""} onChange={cardValueUpdater("clazz")} placeholder={placeholders?.clazz} />
                </EditorLabel>
                <EditorLabel>
                    Type:
                    <EditorInput type="text" value={cardSettings.type ?? ""} onChange={cardValueUpdater("type")} placeholder={placeholders?.type} />
                </EditorLabel>
                <EditorLabel>
                    Level:
                    <EditorInput type="number" min={0} max={99} value={cardSettings.level ?? ""} onChange={cardValueUpdater("level")} placeholder={placeholders?.level === undefined ? undefined : placeholders?.level?.toString()} />
                </EditorLabel>
                <EditorLabel>
                    Color:
                    <EditorInput type="color" value={cardSettings.color ?? ""} onChange={cardValueUpdater("color")} placeholder={placeholders?.color} />
                    <button onClick={clear("color")} disabled={cardSettings.color === undefined}>Clear Color</button>
                </EditorLabel>
                <EditorLabel>
                    Image:
                    <EditorImage src={cardSettings.image} alt="Group Default" />
                    <EditorInput type="file" accept="image/*" onChange={fileInput} ref={imageRef} />
                    <button onClick={clear("image")} disabled={cardSettings.image === undefined}>Remove Image</button>
                </EditorLabel>
            </EditorValues>
        );
    });
}