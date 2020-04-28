/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { createRef, useContext } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType } from "../state";
import { dataFileReaderAsync } from "../util/file";
import AutoResizeTextArea from "./AutoResizeTextArea";
import "./Editor.scss";

/** The editor component */
export default function Editor() {
    const state = useContext(GlobalStateContext);

    // TODO: For saving
    // const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    //     const charCode = String.fromCharCode(event.which).toLowerCase();
    //     if ((event.ctrlKey || event.metaKey) && charCode === "s") {
    //         event.preventDefault();
    //     }
    // };

    return useObserver(() => {
        if (state.selection.type !== SelectionType.None) {
            return <CardSettings />;
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

        const id = state.selection.group;

        const update = (event: React.FormEvent<HTMLInputElement>) => {
            state.groups[id].editName(event.currentTarget.value);
        };

        return (
            <div className="groupsettings">
                <div className="title">Group settings</div>
                <label>
                    Name:
                <input type="text" value={state.groups[state.selection.group].name ?? ""} onChange={update} />
                </label>
            </div>
        );
    });
}

/** The CardSettings section */
function CardSettings() {
    const state = useContext(GlobalStateContext);
    const imageRef = createRef<HTMLInputElement>();

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

        const clearColor = () => {
            if (state.selection.type === SelectionType.Card) {
                state.groups[state.selection.group].editCard(state.selection.card, "color", undefined);
            } else if (state.selection.type === SelectionType.Group) {
                state.groups[state.selection.group].editDefaults("color", undefined);
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
                        <AutoResizeTextArea value={cardSettings.physicalComponents ?? ""} onChange={cardValueUpdater("physicalComponents")} placeholder={placeholders?.physicalComponents} />
                    </label>
                    <label>
                        Description:
                        <AutoResizeTextArea value={cardSettings.description ?? ""} onChange={cardValueUpdater("description")} placeholder={placeholders?.description} />
                    </label>
                    <label>
                        Extended Description:
                        <AutoResizeTextArea value={cardSettings.extDescription ?? ""} onChange={cardValueUpdater("extDescription")} placeholder={placeholders?.extDescription} />
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
                        <input type="number" min={0} max={99} value={cardSettings.level ?? ""} onChange={cardValueUpdater("level")} placeholder={placeholders?.level === undefined ? undefined : placeholders?.level?.toString()} />
                    </label>
                    <label>
                        Color:
                        <input type="color" value={cardSettings.color ?? ""} onChange={cardValueUpdater("color")} placeholder={placeholders?.color} />
                        <button onClick={clearColor}>Clear Color</button>
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
    });
}