import * as React from "react";
import { CardControllerContext, ICardController, ISelection } from "../App";
import ICard from "../Card/Card";
import { dataFileReaderAsync } from "../Util";
import "./Editor.css";

interface IState {
    selection: ISelection;
    placeholders: ICard;
    values: ICard;
    groupName?: string;
    group: boolean;
    selected: boolean;
    saved: boolean;
}
export default class Editor extends React.Component<unknown, IState> {
    /** The card controller */
    private cards: ICardController;

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
            let newState: IState = preState;

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
                let groupChanges = this.cards.getGroupChanges(preState.selection.group);
                let cardChanges = this.cards.getCardChanges(preState.selection.group, preState.selection.card);

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
                    newState.groupName = this.cards.selectedGroup === undefined ? "" : this.cards.selectedGroup.name;
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
            let target = event.currentTarget;

            this.setState(preState => {
                let values = { ...preState.values };
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
        let target = event.currentTarget;

        this.setState({
            groupName: target.value,
            saved: false
        }, this.updateCache);
    }

    private readonly fileInput = async (event: React.FormEvent<HTMLInputElement>) => {
        event.persist();

        if (this.imageRef.current !== null) {
            let target = this.imageRef.current;

            let image: string | undefined;

            if (target.files !== null) {
                let file = target.files[0];
                image = await dataFileReaderAsync(file);
            }

            this.setState(preState => {
                let values = { ...preState.values };
                values.image = image;
                return {
                    saved: false,
                    values
                };
            }, this.updateCache);
        }
    }

    private readonly updateCache = () => {
        if (this.state.group) {
            this.cards.setGroupChanges(this.state.selection.group, {
                defaults: this.state.values,
                groupName: this.state.groupName
            });
        } else {
            this.cards.setCardChanges(this.state.selection.group, this.state.selection.card, this.state.values);
        }
    }

    /** Push the cached values into the master */
    private pushValues() {
        if (this.cards.selectedGroup !== undefined) {
            if (this.state.group) {
                this.cards.selectedGroup.settings = this.state.values;
                this.cards.selectedGroup.name = this.state.groupName === undefined ? "" : this.state.groupName;
            } else {
                this.cards.selectedGroup.editCard(this.state.selection.card, this.state.values);
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

    private readonly handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            this.pushValues();
        }
    }

    public render() {
        return (
            <CardControllerContext.Consumer>{
                cards => {
                    this.cards = cards;

                    return (
                        <div className="editor" onKeyDown={this.handleKeyDown}> {
                            this.state.selected
                                ? <div className="values">
                                    {this.state.group ? (
                                        <div className="groupsettings">
                                            <div className="title">Group settings</div>
                                            <label>
                                                Name:<input type="text" value={this.state.groupName === undefined ? "" : this.state.groupName} onChange={this.groupNameInput} />
                                            </label>
                                        </div>
                                    ) : null}

                                    <div className="title">Card Settings</div>
                                    <label>
                                        Name:<input type="text" value={this.state.values.name === undefined ? "" : this.state.values.name} onChange={this.textInput("name")} placeholder={this.state.placeholders.name} />
                                    </label>
                                    <label>
                                        Casting Time:<input type="text" value={this.state.values.castingTime === undefined ? "" : this.state.values.castingTime} onChange={this.textInput("castingTime")} placeholder={this.state.placeholders.castingTime} />
                                    </label>
                                    <label>
                                        Range:<input type="text" value={this.state.values.range === undefined ? "" : this.state.values.range} onChange={this.textInput("range")} placeholder={this.state.placeholders.range} />
                                    </label>
                                    <label>
                                        Components:<input type="text" value={this.state.values.components !== undefined ? this.state.values.components : ""} onChange={this.textInput("components")} placeholder={this.state.placeholders.components !== undefined ? this.state.placeholders.components : ""} />
                                    </label>
                                    <label>
                                        Duration:<input type="text" value={this.state.values.duration === undefined ? "" : this.state.values.duration} onChange={this.textInput("duration")} placeholder={this.state.placeholders.duration} />
                                    </label>
                                    <label>
                                        Physical Components:<textarea value={this.state.values.physicalComponents === undefined ? "" : this.state.values.physicalComponents} onChange={this.textInput("physicalComponents")} placeholder={this.state.placeholders.physicalComponents} />
                                    </label>
                                    <label>
                                        Description:<textarea value={this.state.values.description === undefined ? "" : this.state.values.description} onChange={this.textInput("description")} placeholder={this.state.placeholders.description} />
                                    </label>
                                    <label>
                                        Extended Description:<textarea value={this.state.values.extDescription === undefined ? "" : this.state.values.extDescription} onChange={this.textInput("extDescription")} placeholder={this.state.placeholders.extDescription} />
                                    </label>
                                    <label>
                                        Class:<input type="text" value={this.state.values.class === undefined ? "" : this.state.values.class} onChange={this.textInput("class")} placeholder={this.state.placeholders.class} />
                                    </label>
                                    <label>
                                        Type:<input type="text" value={this.state.values.type === undefined ? "" : this.state.values.type} onChange={this.textInput("type")} placeholder={this.state.placeholders.type} />
                                    </label>
                                    <label>
                                        Level:<input type="number" value={this.state.values.level === undefined ? "" : this.state.values.level} onChange={this.textInput("level")} placeholder={this.state.placeholders.level !== undefined ? this.state.placeholders.level.toString() : undefined} />
                                    </label>
                                    <label>
                                        Color:<input type="text" value={this.state.values.color === undefined ? "" : this.state.values.color} onChange={this.textInput("color")} placeholder={this.state.placeholders.color} />
                                    </label>
                                    <label>
                                        Image:
                                        <img src={this.state.values.image} />
                                        <input type="file" accept="image/*" onChange={this.fileInput} ref={this.imageRef} />
                                    </label>

                                    <button className={`save ${this.state.saved ? "saved" : "unsaved"}`} onClick={this.saveClick}>Save</button>
                                </div>
                                // TODO: WELCOME
                                : <div className="empty">
                                    You have nothing selected
                                </div>
                        }</div>
                    );
                }
            }</CardControllerContext.Consumer>
        );
    }
}