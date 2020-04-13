/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useObserver } from "mobx-react-lite";
import React, { createRef, useContext } from "react";
import ICard from "../card/card";
import { GlobalStateContext, SelectionType, UserSelection } from "../state";
import { dataFileReaderAsync } from "../Util";
import "./Editor.css";

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
                    state.editCard(state.selection.group.id, state.selection.card.id, name, event.currentTarget.value);
                } else if (state.selection.type === SelectionType.Group) {
                    state.editGroupDefaults(state.selection.group.id, name, event.currentTarget.value);
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

        const GroupSettings = (selection: UserSelection) => {
            if (selection.type !== SelectionType.Group) {
                return null;
            }

            const update = (event: React.FormEvent<HTMLInputElement>) => state.editGroupName(selection.group.id, event.currentTarget.value);

            return (
                <div className="groupsettings">
                    <div className="title">Group settings</div>
                    <label>
                        Name:
                        <input type="text" value={selection.group.value.metadata.name ?? ""} onChange={update} />
                    </label>
                </div>
            );
        };

        if (state.selection.type !== SelectionType.None) {
            const cardSettings = state.selection.type === SelectionType.Card ? state.selection.card.raw : state.selection.group.value.metadata.defaults;
            const placeholders = state.selection.type === SelectionType.Card ? state.selection.group.value.metadata.defaults : undefined;

            return (
                <div className="editor">
                    <div className="values">
                        <GroupSettings {...state.selection} />

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
                            <input type="text" value={cardSettings.class ?? ""} onChange={cardValueUpdater("class")} placeholder={placeholders?.class} />
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
                            <input type="text" value={cardSettings.color ?? ""} onChange={cardValueUpdater("color")} placeholder={placeholders?.color} />
                        </label>
                        <label>
                            Image:
                            <img src={cardSettings.image} />
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

export default class Editor extends React.Component<unknown, IState> {
    private readonly imageRef: React.RefObject<HTMLInputElement>;

    public constructor(props: unknown, context: unknown) {
        super(props, context);

        this.state = {
            group: false,
            placeholders: {},
            saved: true,
            selected: false,
            selection: { card: -1, group: -1 },
            values: {},
        };

        this.imageRef = React.createRef();
    }

    /** Update the selection to the current one */
    public updateSelection() {
        // Cache unsaved changes
        if (!this.state.saved && this.state.selected) {
            this.updateCache();
        }

        this.setState(preState => {
            const newState: IState = preState;

            if (this.cards.selection.group === -1 || this.cards.groups.length === 0) {
                newState.group = false;
                newState.selected = false;
            } else if (this.cards.selection.card === -1) {
                newState.group = true;
                newState.selected = true;
            } else {
                newState.group = false;
                newState.selected = true;
            }

            newState.selection = this.cards.selection;

            newState.placeholders = newState.group && newState.selected
                ? {}
                : (this.cards.selectedGroup !== undefined
                    ? this.cards.selectedGroup.settings
                    : {});

            if (newState.selected) {
                const groupChanges = this.cards.getGroupChanges(preState.selection.group);
                const cardChanges = this.cards.getCardChanges(preState.selection.group, preState.selection.card);

                if (newState.group && groupChanges !== undefined) {
                    newState.values = groupChanges.defaults;
                    newState.groupName = groupChanges.groupName;
                    newState.saved = false;
                } else if (!newState.group && cardChanges !== undefined) {
                    newState.values = cardChanges;
                    newState.groupName = undefined;
                    newState.saved = false;
                } else if (newState.group) {
                    newState.values = this.cards.selectedGroup !== undefined ? this.cards.selectedGroup.settings : {};
                    newState.groupName = this.cards.selectedGroup ?? "" : this.cards.selectedGroup.name;
                    newState.saved = true;
                } else {
                    newState.values = this.cards.selectedRawCard !== undefined ? this.cards.selectedRawCard : {};
                    newState.groupName = undefined;
                    newState.saved = true;
                }
            } else {
                newState.values = {};
            }

            return newState;
        });
    }

    public componentDidMount() {
        if (this.state.selection.card !== this.cards.selection.card || this.state.selection.group !== this.cards.selection.group) {
            this.updateSelection();
        }
    }
    public componentDidUpdate() {
        if (this.state.selection.card !== this.cards.selection.card || this.state.selection.group !== this.cards.selection.group) {
            this.updateSelection();
        }
    }

    /** Update the internal cache values of a text value */
    private textInput(name: keyof ICard) {
        return (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            event.persist();
            const target = event.currentTarget;

            this.setState(preState => {
                const values = { ...preState.values };
                values[name] = target.value;
                return {
                    saved: false,
                    values
                };
            }, this.updateCache);
        };
    }

    /** Update the internal cache values of group's name */
    private readonly groupNameInput = (event: React.FormEvent<HTMLInputElement>) => {
        event.persist();
        const target = event.currentTarget;

        this.setState({
            groupName: target.value,
            saved: false
        }, this.updateCache);
    }



    private readonly updateCache = () => {
        if (this.state.group) {
            this.cards.setGroupChanges(this.state.selection.group, {
                defaults: cardSettings,
                groupName: this.state.groupName
            });
        } else {
            this.cards.setCardChanges(this.state.selection.group, this.state.selection.card, cardSettings);
        }
    }

    /** Push the cached values into the master */
    private pushValues() {
        if (this.cards.selectedGroup !== undefined) {
            if (this.state.group) {
                this.cards.selectedGroup.settings = cardSettings;
                this.cards.selectedGroup.name = this.state.groupName ?? "" : this.state.groupName;
            } else {
                this.cards.selectedGroup.editCard(this.state.selection.card, cardSettings);
            }

            if (this.state.group) {
                this.cards.setGroupChanges(this.state.selection.group, undefined);
            } else {
                this.cards.setCardChanges(this.state.selection.group, this.state.selection.card, undefined);
            }

            this.cards.save();

            this.setState({
                saved: true
            });

            this.cards.refresh();
        }
    }

    private readonly saveClick = () => this.pushValues();


}