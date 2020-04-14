/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { Observer, useObserver } from "mobx-react-lite";
import React, { createRef, useContext } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType, GlobalState } from "../state";
import { dataFileReaderAsync } from "../util";
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

        const id = state.selection.group.id;

        const update = (event: React.FormEvent<HTMLInputElement>) => {
            console.log(id);
            state.getGroup(id).editName(event.currentTarget.value);
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

const cardSettings = (ls: GlobalState) => ls.selection.type === SelectionType.Card ? ls.selection.card.raw : ls.selection.type === SelectionType.Group ? ls.selection.group.value.defaults : {};
const placeholders = (ls: GlobalState) => ls.selection.type === SelectionType.Card ? ls.selection.group.value.defaults : undefined;

/** The CardSettings section */
function CardSettings() {
    const state = useContext(GlobalStateContext);
    const imageRef = createRef<HTMLInputElement>();

    /** Update the internal cache values of a text value */
    const cardValueUpdater = (name: keyof ICard) => {
        return (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            event.persist();

            if (state.selection.type === SelectionType.Card) {
                state.getGroup(state.selection.group.id).editCard(state.selection.card.id, name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
            } else if (state.selection.type === SelectionType.Group) {
                state.getGroup(state.selection.group.id).editDefaults(name, event.currentTarget.value === "" ? undefined : event.currentTarget.value);
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

                state.getGroup(state.selection.group.id).editCard(state.selection.card.id, "image", image);
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
                    <Observer>{() => <input type="text" value={(state.selection.type === SelectionType.Card ? state.selection.card.raw : state.selection.type === SelectionType.Group ? state.selection.group.value.defaults : {}).name ?? ""} onChange={cardValueUpdater("name")} placeholder={(state.selection.type === SelectionType.Card ? state.selection.card.raw : state.selection.type === SelectionType.Group ? state.selection.group.value.defaults : {})?.name} />}</Observer>
                </label>
                <label>
                    Casting Time:
                    <Observer>{() => <input type="text" value={cardSettings(state).castingTime ?? ""} onChange={cardValueUpdater("castingTime")} placeholder={placeholders(state)?.castingTime} />}</Observer>
                </label>
                <label>
                    Range:
                    <Observer>{() => <input type="text" value={cardSettings(state).range ?? ""} onChange={cardValueUpdater("range")} placeholder={placeholders(state)?.range} />}</Observer>
                </label>
                <label>
                    Components:
                    <Observer>{() => <input type="text" value={cardSettings(state).components ?? ""} onChange={cardValueUpdater("components")} placeholder={placeholders(state)?.components ?? ""} />}</Observer>
                </label>
                <label>
                    Duration:
                    <Observer>{() => <input type="text" value={cardSettings(state).duration ?? ""} onChange={cardValueUpdater("duration")} placeholder={placeholders(state)?.duration} />}</Observer>
                </label>
                <label>
                    Physical Components:
                    <Observer>{() => <textarea value={cardSettings(state).physicalComponents ?? ""} onChange={cardValueUpdater("physicalComponents")} placeholder={placeholders(state)?.physicalComponents} />}</Observer>
                </label>
                <label>
                    Description:
                    <Observer>{() => <textarea value={cardSettings(state).description ?? ""} onChange={cardValueUpdater("description")} placeholder={placeholders(state)?.description} />}</Observer>
                </label>
                <label>
                    Extended Description:
                    <Observer>{() => <textarea value={cardSettings(state).extDescription ?? ""} onChange={cardValueUpdater("extDescription")} placeholder={placeholders(state)?.extDescription} />}</Observer>
                </label>
                <label>
                    Class:
                    <Observer>{() => <input type="text" value={cardSettings(state).clazz ?? ""} onChange={cardValueUpdater("clazz")} placeholder={placeholders(state)?.clazz} />}</Observer>
                </label>
                <label>
                    Type:
                    <Observer>{() => <input type="text" value={cardSettings(state).type ?? ""} onChange={cardValueUpdater("type")} placeholder={placeholders(state)?.type} />}</Observer>
                </label>
                <label>
                    Level:
                    <Observer>{() => <input type="number" value={cardSettings(state).level ?? ""} onChange={cardValueUpdater("level")} placeholder={placeholders(state)?.level === undefined ? undefined : placeholders(state)?.level?.toString()} />}</Observer>
                </label>
                <label>
                    Color:
                    <Observer>{() => <input type="color" value={cardSettings(state).color ?? ""} onChange={cardValueUpdater("color")} placeholder={placeholders(state)?.color} />}</Observer>
                </label>
                <label>
                    Image:
                    <Observer>{() => <img src={cardSettings(state).image} alt="Card Back" />}</Observer>
                    <input type="file" accept="image/*" onChange={fileInput} ref={imageRef} />
                </label>

                {/* TODO:? <button className={`save ${this.state.saved ? "saved" : "unsaved"}`} onClick={this.saveClick}>Save</button> */}
            </div>
        </div>
    );
}