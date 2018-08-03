import * as React from "react";
import { CardControllerContext, ICardController } from "../App";

export default class Editor extends React.Component {
    private readonly CardEditor = ({ cards }: { cards: ICardController }) => {
        let selectedGroup = cards.groups[cards.selection.group];
        let values = selectedGroup.getRawCard(cards.selection.card);
        let defaults = selectedGroup.settings;

        return (
            <div className="values card">
                <pre>{JSON.stringify([values, defaults], null, 4)}</pre>

                <label>
                    Name <input type="text" value={values.name} placeholder={defaults.name} />
                </label>
                <br/>
                <label>
                    Casting Time <input type="text" value={values.castingTime} placeholder={defaults.castingTime} />
                </label>
                <br/>
                <label>
                    Class <input type="text" value={values.class} placeholder={defaults.class} />
                </label>
                <br/>
                <label>
                    Color <input type="text" value={values.color} placeholder={defaults.color} />
                </label>
                <br/>
                <label>
                    Components
                    {
                        values.components &&
                        values.components.map((x, i) => (
                            <input type="text" value={x} placeholder={defaults.components && defaults.components[i]} />
                        ))
                    }
                </label>
                <br/>
                <label>
                    Description<input type="text" value={values.description} placeholder={defaults.description} />
                </label>
                <br/>
                <label>
                    Duration <input type="text" value={values.duration} placeholder={defaults.duration} />
                </label>
                <br/>
                <label>
                    Extended Description <input type="text" value={values.extDescription} placeholder={defaults.extDescription} />
                </label>
                <br/>
                <label>
                    Image <input type="file" value={values.image} placeholder={defaults.image} />
                </label>
                <br/>
                <label>
                    Level <input type="text" value={values.level} placeholder={defaults.level} />
                </label>
                <br/>
                <label>
                    Physical Components* <input type="text" value={values.physicalComponents} placeholder={defaults.physicalComponents} />
                </label>
                <br/>
                <label>
                    Range <input type="text" value={values.range} placeholder={defaults.range} />
                </label>
                <br/>
                <label>
                    Type <input type="text" value={values.type} placeholder={defaults.type} />
                </label>
            </div>
        );
    }

    private readonly GroupEditor = ({ cards }: { cards: ICardController }) => {
        let selectedGroup = cards.groups[cards.selection.group];
        let values = selectedGroup.settings;

        return (
            <div className="values group">
                <pre>{JSON.stringify(values, null, 4)}</pre>
            </div>
        );
    }

    public render() {
        return (
            <CardControllerContext.Consumer>{
                cards => (
                    <div className="editor">
                        {
                            cards.selection.group === -1
                                ? <div className="empty">
                                    You have nothing selected
                                </div>
                                : (cards.selection.card > -1
                                    ? <this.CardEditor cards={cards} />
                                    : <this.GroupEditor cards={cards} />
                                )
                        }
                        {/* <h1>Editing a {cards.selection.card === -1 ? "group" : "card"}</h1>

                                {cards.selection.card > -1 &&
                                    <div>
                                        Full card
                                        <pre>
                                            {JSON.stringify(cards.groups[cards.selection.group].getCard(cards.selection.card), null, 4)}
                                        </pre>

                                        Override values
                                        <pre>
                                            {JSON.stringify(cards.groups[cards.selection.group].getRawCard(cards.selection.card), null, 4)}
                                        </pre>
                                    </div>
                                }

                                Default values from "{cards.groups[cards.selection.group].name}"
                                <pre>
                                    {JSON.stringify(cards.groups[cards.selection.group].settings, null, 4)}
                                </pre>
                            </div>
                        }
                         */}
                    </div>
                )
            }</CardControllerContext.Consumer>
        );
    }
}