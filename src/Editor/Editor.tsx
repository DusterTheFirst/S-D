import * as React from "react";
import { CardControllerContext, ICardController, ISelection } from "../App";
import ICard from "../Card/Card";
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
    }

    /** Update the selection to the current one */
    public updateSelection() {
        // Cache unsaved changes
        if (!this.state.saved && this.state.selected) {
            this.updateCache();
        }

        console.log(this.state);

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
        return (event: React.FormEvent<HTMLInputElement>) => {
            event.persist();
            let target = event.currentTarget;

            this.setState(preState => {
                let values = { ... preState.values };
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

    public render() {
        return (
            <CardControllerContext.Consumer>{
                cards => {
                    this.cards = cards;

                    return (
                        <div className="editor"> {
                            this.state.selected
                                ? <div className="values">
                                    {this.state.group ? (
                                        <div className="groupsettings">
                                            <div className="title">Group settings</div>
                                            <label>
                                                Name <input type="text" value={this.state.groupName === undefined ? "" : this.state.groupName} onChange={this.groupNameInput} />
                                            </label>
                                        </div>
                                    ) : null}

                                    <div className="title">Card Settings</div>
                                    <label>
                                        Name <input type="text" value={this.state.values.name === undefined ? "" : this.state.values.name} onChange={this.textInput("name")} placeholder={this.state.placeholders.name} />
                                    </label>
                                    <br />
                                    <label>
                                        Casting Time <input type="text" value={this.state.values.castingTime === undefined ? "" : this.state.values.castingTime} onChange={this.textInput("castingTime")} placeholder={this.state.placeholders.castingTime} />
                                    </label>
                                    <br />
                                    <label>
                                        Class <input type="text" value={this.state.values.class === undefined ? "" : this.state.values.class} onChange={this.textInput("class")} placeholder={this.state.placeholders.class} />
                                    </label>
                                    <br />
                                    <label>
                                        Color <input type="text" value={this.state.values.color === undefined ? "" : this.state.values.color} onChange={this.textInput("color")} placeholder={this.state.placeholders.color} />
                                    </label>
                                    <br />
                                    <label>
                                        {/* TODO: Custom input for components */}
                                        {/* Components <input type="text"placeholder={this.state.placeholders.components && this.state.placeholders.components.join(", ")} /> */}
                                    </label>
                                    <br />
                                    <label>
                                        Description<input type="text" value={this.state.values.description === undefined ? "" : this.state.values.description} onChange={this.textInput("description")} placeholder={this.state.placeholders.description} />
                                    </label>
                                    <br />
                                    <label>
                                        Duration <input type="text" value={this.state.values.duration === undefined ? "" : this.state.values.duration} onChange={this.textInput("duration")} placeholder={this.state.placeholders.duration} />
                                    </label>
                                    <br />
                                    <label>
                                        Extended Description <input type="text" value={this.state.values.extDescription === undefined ? "" : this.state.values.extDescription} onChange={this.textInput("extDescription")} placeholder={this.state.placeholders.extDescription} />
                                    </label>
                                    <br />
                                    <label>
                                        {/* TODO: Image UPLOADING */}
                                        {/* Image <input type="file" accept="image/*" value={this.state.values.image === undefined ? "" : this.state.values.image} onChange={this.updateCard("image")} placeholder={defaults.image} /> */}
                                    </label>
                                    <br />
                                    <label>
                                        Level <input type="text" value={this.state.values.level === undefined ? "" : this.state.values.level} onChange={this.textInput("level")} placeholder={this.state.placeholders.level} />
                                    </label>
                                    <br />
                                    <label>
                                        Physical Components* <input type="text" value={this.state.values.physicalComponents === undefined ? "" : this.state.values.physicalComponents} onChange={this.textInput("physicalComponents")} placeholder={this.state.placeholders.physicalComponents} />
                                    </label>
                                    <br />
                                    <label>
                                        Range <input type="text" value={this.state.values.range === undefined ? "" : this.state.values.range} onChange={this.textInput("range")} placeholder={this.state.placeholders.range} />
                                    </label>
                                    <br />
                                    <label>
                                        Type <input type="text" value={this.state.values.type === undefined ? "" : this.state.values.type} onChange={this.textInput("type")} placeholder={this.state.placeholders.type} />
                                    </label>

                                    <button className="save" onClick={this.saveClick}>Save</button>
                                </div>
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