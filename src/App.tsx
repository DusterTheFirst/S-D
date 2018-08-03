import * as React from "react";
import "./App.css";
import ICard from "./Card/Card";
import CardGroup from "./Card/CardGroup";
import "./ContextMenu.css";
import Editor from "./Editor/Editor";
import Explorer from "./Explorer/Explorer";

export interface ISelection {
    card: number;
    group: number;
}
export interface ICardController {
    select(group: number, card?: number): void;
    selectGenerator(group: number, card: number): () => void;

    addCard(group: number, card?: ICard): void;
    addGroup(group: CardGroup): void;

    removeCard(group: number, card: number): void;
    removeGroup(group: number): void;

    moveCard(group: number, card: number, newpos: number): void;

    selection: ISelection;
    groups: CardGroup[];
}
export const CardControllerContext = React.createContext<ICardController>({
    addCard: () => void 0,
    addGroup: () => void 0,
    groups: [],
    moveCard: () => void 0,
    removeCard: () => void 0,
    removeGroup: () => void 0,
    select: () => void 0,
    selectGenerator: () => () => void 0,
    selection: { card: 0, group: 0 }
});

interface IAppState {
    groups: CardGroup[];
    selectedcard: number;
    selectedgroup: number;
}
export default class App extends React.Component<{}, IAppState> {
    constructor(props: {}, context?: {}) {
        super(props, context);

        let cardgroup = new CardGroup({name: "asdasdad"})
            .addCard({
                name: "adfsasg"
            }).addCard({
                class: "history",
                name: "hehe"
            }).addCard({
                name: "ds"
            }).addCard({
                name: "aaaa"
            }).addCard({
                name: "i need help"
            }).addCard({
                name: "help i need"
            }).addCard({
                name: "qwetqtwt"
            }).addCard({
                name: "nate"
            });

        let g1 = new CardGroup({name: "yeet"})
            .addCard({
                name: "yote"
            }).addCard({
                class: "history",
                name: "yate"
            }).addCard({
                name: "yaite"
            }).addCard({
                name: "yoted"
            }).addCard({
                name: "yeetled"
            }).addCard({
                name: "zippity"
            }).addCard({
                name: "zoppity"
            }).addCard({
                name: "ahvfsjhafdjhgafds"
            });

        let g2 = new CardGroup({name: "rytrruyrtuy"})
            .addCard({
                name: "de se"
            }).addCard({
                name: "adsd"
            }).addCard({
                name: "mien"
            }).addCard({
                name: "gigantorum"
            }).addCard({
                name: "rwer"
            }).addCard({
                name: "and"
            }).addCard({
                name: "so"
            }).addCard({
                name: "it was"
            }).addCard({
                name: "de se"
            }).addCard({
                name: "adsd"
            }).addCard({
                name: "mien"
            }).addCard({
                name: "gigantorum"
            }).addCard({
                name: "rwer"
            }).addCard({
                name: "and"
            }).addCard({
                name: "so"
            }).addCard({
                name: "it was"
            }).addCard({
                name: "de se"
            }).addCard({
                name: "adsd"
            }).addCard({
                name: "mien"
            }).addCard({
                name: "gigantorum"
            }).addCard({
                name: "rwer"
            }).addCard({
                name: "and"
            }).addCard({
                name: "so"
            }).addCard({
                name: "it was"
            });

        cardgroup.settings = {
            castingTime: "1",
            class: "2",
            color: "3",
            components: ["v", "s", "a"],
            description: "4",
            duration: "5",
            extDescription: "6",
            image: "7",
            level: "8",
            name: "10",
            physicalComponents: "11",
            range: "12",
            type: "14",
        };

        this.state = {
            groups: [
                cardgroup,
                g1,
                g2
            ],
            selectedcard: 0,
            selectedgroup: 0
        };
    }

    private readonly selectCard = (group: number, card = -1) =>
        this.setState({
            selectedcard: card,
            selectedgroup: group
        })

    private readonly selectCardGenerator = (group: number, card: number) =>
        () => this.selectCard(group, card)

    private readonly moveCard = (group: number, card: number, newpos: number) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            groups[group].moveCard(card, newpos);

            return {
                groups
            };
        })

    private readonly addCard = (group: number, card?: ICard) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            groups[group].addCard(card);

            return {
                groups
            };
        })

    private readonly removeCard = (group: number, card: number) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            groups[group].removeCard(card);

            return {
                groups
            };
        })

    private readonly addGroup = (group: CardGroup) => {
        this.setState(prevState => ({
            groups: [...prevState.groups, group]
        }));
    }

    private readonly removeGroup = (group: number) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            groups.splice(group, 1);

            return {
                groups
            };
        })

    public shouldComponentUpdate(nextProps: {}, nextState: IAppState): boolean {
        if (nextState.selectedgroup === -1 && nextState.selectedcard === -1) {
            return true;
        } else if (nextState.selectedgroup >= nextState.groups.length) {
            this.setState(prevState => ({
                selectedgroup: prevState.groups.length - 1
            }));
            return false;
        } else if (nextState.groups[nextState.selectedgroup] && nextState.selectedcard >= nextState.groups[nextState.selectedgroup].getRawCards().length) {
            this.setState({
                selectedcard: nextState.groups[nextState.selectedgroup].getRawCards().length - 1
            });
            return false;
        }
        return true;
    }

    public render() {
        return (
            <div className="app">
                <CardControllerContext.Provider value={{
                    addCard: this.addCard,
                    addGroup: this.addGroup,
                    groups: this.state.groups,
                    moveCard: this.moveCard,
                    removeCard: this.removeCard,
                    removeGroup: this.removeGroup,
                    select: this.selectCard,
                    selectGenerator: this.selectCardGenerator,
                    selection: { card: this.state.selectedcard, group: this.state.selectedgroup }
                }}>
                    <div className="workspace">
                        <Explorer />
                    </div>
                    <div className="settings">
                        <Editor />
                    </div>
                    <div className="renders">
                        <canvas className="frontview view" />
                        <hr />
                        <canvas className="backview view" />
                    </div>
                </CardControllerContext.Provider>
            </div>
        );
    }
}
