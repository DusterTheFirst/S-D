/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { createRef, useContext } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import { dataFileReaderAsync } from "../util";
import "./Editor.scss";

/** The editor component */
export default function Editor() {
    const state = useContext(GlobalStateContext);
    const imageRef = createRef<HTMLInputElement>();

    // TODO: For saving
    // const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    //     const charCode = String.fromCharCode(event.which).toLowerCase();
    //     if ((event.ctrlKey || event.metaKey) && charCode === "s") {
    //         event.preventDefault();
    //     }
    // };

    return useObserver(() => {
        /** Update the internal cache values of a text value */
        const cardValueUpdater = (name: keyof ICard) => {
            return (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                event.persist();

                if (state.selection.type === SelectionType.Card) {
                    state.editCard(state.selection.group.id, state.selection.card.id, name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
                } else if (state.selection.type === SelectionType.Group) {
                    state.editGroupDefaults(state.selection.group.id, name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
                }
            };
        };

        const fileInput = async (event: React.FormEvent<HTMLInputElement>) => {
            event.persist();

            if (state.selection.type === SelectionType.Card) {
                if (imageRef.current !== null) {
                    let image: string | undefined;

                    if (imageRef.current.files !== null) {
                        image = await dataFileReaderAsync(imageRef.current.files[0]);
                    }

                    state.editCard(state.selection.group.id, state.selection.card.id, "image", image);
                }
            }
        };

        if (state.selection.type !== SelectionType.None) {
            const cardSettings = state.selection.type === SelectionType.Card ? state.selection.card.raw : state.selection.group.value.defaults;
            const placeholders = state.selection.type === SelectionType.Card ? state.selection.group.value.defaults : undefined;

            return (
                <div className="editor">
                    <div className="values">
                        <GroupSettings />

                        <div className="title">Card Settings</div>
                        <label>
                            Name:
                            <input type="text" value={cardSettings.name ?? ""} onChange={cardValueUpdater("name")} placeholder={placeholders?.name} />
                        </label>
                        <label>
                            Casting Time:
                            <input type="text" value={cardSettings.castingTime ?? ""} onChange={cardValueUpdater("castingTime")} placeholder={placeholders?.castingTime} />
                        </label>
                        <label>
                            Range:
                            <input type="text" value={cardSettings.range ?? ""} onChange={cardValueUpdater("range")} placeholder={placeholders?.range} />
                        </label>
                        <label>
                            Components:
                            <input type="text" value={cardSettings.components ?? ""} onChange={cardValueUpdater("components")} placeholder={placeholders?.components ?? ""} />
                        </label>
                        <label>
                            Duration:
                            <input type="text" value={cardSettings.duration ?? ""} onChange={cardValueUpdater("duration")} placeholder={placeholders?.duration} />
                        </label>
                        <label>
                            Physical Components:
                            <textarea value={cardSettings.physicalComponents ?? ""} onChange={cardValueUpdater("physicalComponents")} placeholder={placeholders?.physicalComponents} />
                        </label>
                        <label>
                            Description:
                            <textarea value={cardSettings.description ?? ""} onChange={cardValueUpdater("description")} placeholder={placeholders?.description} />
                        </label>
                        <label>
                            Extended Description:
                            <textarea value={cardSettings.extDescription ?? ""} onChange={cardValueUpdater("extDescription")} placeholder={placeholders?.extDescription} />
                        </label>
                        <label>
                            Class:
                            <input type="text" value={cardSettings.clazz ?? ""} onChange={cardValueUpdater("clazz")} placeholder={placeholders?.clazz} />
                        </label>
                        <label>
                            Type:
                            <input type="text" value={cardSettings.type ?? ""} onChange={cardValueUpdater("type")} placeholder={placeholders?.type} />
                        </label>
                        <label>
                            Level:
                            <input type="number" value={cardSettings.level ?? ""} onChange={cardValueUpdater("level")} placeholder={placeholders?.level === undefined ? undefined : placeholders?.level.toString()} />
                        </label>
                        <label>
                            Color:
                            <input type="color" value={cardSettings.color ?? ""} onChange={cardValueUpdater("color")} placeholder={placeholders?.color} />
                        </label>
                        <label>
                            Image:
                            <img src={cardSettings.image} alt="Card Back" />
                            <input type="file" accept="image/*" onChange={fileInput} ref={imageRef} />
                        </label>

                        {/* TODO:? <button className={`save ${this.state.saved ? "saved" : "unsaved"}`} onClick={this.saveClick}>Save</button> */}
                    </div>
                </div>
            );
        } else {
            return <div className="empty">You have nothing selected</div>;
        }
    });
}

/** The group settings part */
function GroupSettings() {
    const state = useContext(GlobalStateContext);

    return useObserver(() => {
        if (state.selection.type !== SelectionType.Group) {
            return null;
        }

        const id = state.selection.group.id;

        const update = (event: React.FormEvent<HTMLInputElement>) => {
            console.log(id);
            state.editGroupName(id, event.currentTarget.value);
        };

        return (
            <div className="groupsettings">
                <div className="title">Group settings</div>
                <label>
                    Name:
                <input type="text" value={state.selection.group.value.name ?? ""} onChange={update} />
                </label>
            </div>
        );
    });
}