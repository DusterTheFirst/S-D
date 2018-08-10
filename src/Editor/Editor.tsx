import * as React from "react";
import { CardControllerContext, ICardController, ISelection } from "../App";
import ICard from "../Card/Card";
import { TwoDimensionalArray } from "../Util";

interface IGroupChanges {
    defaults: ICard;
    groupName?: string;
}

interface IState {
    selection: ISelection;
    placeholders: ICard;
    values: ICard;
    groupName?: string;
    group: boolean;
    selected: boolean;
}
export default class Editor extends React.Component<unknown, IState> {
    /** The card controller */
    private cards: ICardController;

    /** All unsaved changes */
    private readonly cardChanges: TwoDimensionalArray<ICard> = new TwoDimensionalArray<ICard>();
    private readonly groupChanges: IGroupChanges[] = [];

    public constructor(props: unknown, context: unknown) {
        super(props, context);

        this.state = {
            group: false,
            placeholders: {},
            selected: false,
            selection: { card: -1, group: -1 },
            values: {}
        };
    }

    /** Update the selection to the current one TODO: cache unsaved changes & load from old unsaved changes if they exist */
    public updateSelection() {
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

            newState.values = newState.selected
                ? (newState.group
                    ? (this.cards.selectedGroup !== undefined
                        ? this.cards.selectedGroup.settings
                        : {})
                    : (this.cards.selectedRawCard === undefined
                        ? {}
                        : this.cards.selectedRawCard))
                    : {};

            if (newState.group) {
                newState.groupName = this.cards.selectedGroup === undefined ? "" : this.cards.selectedGroup.name;
            }

            return newState;
        });
    }

    public componentDidMount() {
        if (this.state.selection !== this.cards.selection) {
            this.updateSelection();
        }
    }
    public componentDidUpdate() {
        if (this.state.selection !== this.cards.selection) {
            this.updateSelection();
        }
    }

    /** Update the internal cache values of a text value TODO: display unsaved icon */
    private textInput(name: keyof ICard) {
        return (event: React.FormEvent<HTMLInputElement>) => {
            event.persist();
            let target = event.currentTarget;
            this.setState(preState => {
                let values = { ... preState.values };
                values[name] = target.value;
                return {
                    values
                };
            });
        };
    }

    /** Update the internal cache values of group's name TODO: display unsaved icon */
    private readonly groupNameInput = (event: React.FormEvent<HTMLInputElement>) => {
        event.persist();
        let target = event.currentTarget;
        this.setState({
            groupName: target.value
        });
    }

    /** Push the cached values into the master TODO: hide unsaved icon */
    private pushValues() {
        if (this.cards.selectedGroup !== undefined) {
            if (this.state.group) {
                this.cards.selectedGroup.settings = this.state.values;
                this.cards.selectedGroup.name = this.state.groupName === undefined ? "" : this.state.groupName;
            } else {
                this.cards.selectedGroup.editCard(this.state.selection.card, this.state.values);
            }
            this.cards.refresh();
            this.cards.save();
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
                                    <pre>{JSON.stringify([this.state.selection, this.state.values, this.state.placeholders], null, 4)}</pre>

                                    {this.state.group ? (
                                        <div className="groupsettings">
                                            <h1>Group settings</h1>
                                            <label>
                                                Name <input type="text" value={this.state.groupName === undefined ? "" : this.state.groupName} onChange={this.groupNameInput} />
                                            </label>
                                        </div>
                                    ) : null}

                                    <h1>Card Settings</h1>
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