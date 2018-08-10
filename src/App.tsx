import * as React from "react";
import "./App.css";
import ICard from "./Card/Card";
import CardGroup, { ICardGroup } from "./Card/CardGroup";
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
    groups: Array<CardGroup | undefined>;

    selectedCard?: ICard;
    selectedRawCard?: ICard;
    selectedGroup?: CardGroup;

    refresh(): void;
    save(): void;
}
export const CardControllerContext = React.createContext<ICardController>({
    addCard: () => void 0,
    addGroup: () => void 0,
    groups: [],
    moveCard: () => void 0,
    refresh: () => void 0,
    removeCard: () => void 0,
    removeGroup: () => void 0,
    save: () => void 0,
    select: () => void 0,
    selectGenerator: () => () => void 0,
    selectedCard: undefined,
    selectedGroup: new CardGroup({ name: "placeholder" }),
    selectedRawCard: undefined,
    selection: { card: 0, group: 0 },
});

interface IAppState {
    groups: Array<CardGroup | undefined>;
    selectedcard: number;
    selectedgroup: number;
}
// FIXME: Warnings for unsaved changes (save them temporarily in the editor and display an icon)
// TODO: warn about unsaved before unload
export default class App extends React.Component<unknown, IAppState> {
    constructor(props: unknown, context?: unknown) {
        super(props, context);

        this.state = {
            groups: this.load(),
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

            let groupselect = groups[group];
            if (groupselect !== undefined) {
                groupselect.moveCard(card, newpos);
            }

            return {
                groups
            };
        }, () => this.save())

    private readonly addCard = (group: number, card?: ICard) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            let groupselect = groups[group];
            if (groupselect !== undefined) {
                groupselect.addCard(card);
            }

            return {
                groups
            };
        }, () => this.save())

    private readonly removeCard = (group: number, card: number) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            let groupselect = groups[group];
            if (groupselect !== undefined) {
                groupselect.removeCard(card);
            }

            return {
                groups
            };
        }, () => this.save())

    private readonly addGroup = (group: CardGroup) => {
        this.setState(prevState => ({
            groups: [...prevState.groups, group]
        }), () => this.save());
    }

    private readonly removeGroup = (group: number) =>
        this.setState(prevState => {
            let groups = prevState.groups;

            groups.splice(group, 1);

            return {
                groups
            };
        }, () => this.save())

    public shouldComponentUpdate(nextProps: unknown, nextState: IAppState): boolean {
        let selectedgroup = nextState.groups[nextState.selectedgroup];

        if (nextState.selectedgroup === -1 && nextState.selectedcard === -1) {
            return true;
        } else if (nextState.selectedgroup >= nextState.groups.length) {
            this.setState(prevState => ({
                selectedgroup: prevState.groups.length - 1
            }));
            return false;
        } else if (selectedgroup !== undefined && nextState.selectedcard >= selectedgroup.getRawCards().length) {
            this.setState({
                selectedcard: selectedgroup.getRawCards().length - 1
            });
            return false;
        }
        return true;
    }

    /** Save the cards to localstorage */
    private save() {
        localStorage.setItem("sd-cards", JSON.stringify(this.state.groups));
    }

    /** Load the cards from localstorage */
    private load(): CardGroup[] {
        let str = localStorage.getItem("sd-cards");
        if (str !== null) {
            let groups = [];
            let groupdefaults = JSON.parse(str) as ICardGroup[];
            for (let def of groupdefaults) {
                groups.push(new CardGroup(def));
            }
            return groups;
        }
        return [];
    }

    public render() {
        let selectedgroup = this.state.groups[this.state.selectedgroup];

        return (
            <div className="app">
                <CardControllerContext.Provider value={{
                    addCard: this.addCard,
                    addGroup: this.addGroup,
                    groups: this.state.groups,
                    moveCard: this.moveCard,
                    refresh: () => this.forceUpdate(),
                    removeCard: this.removeCard,
                    removeGroup: this.removeGroup,
                    save: () => this.save(),
                    select: this.selectCard,
                    selectGenerator: this.selectCardGenerator,
                    selectedCard: selectedgroup !== undefined ? selectedgroup.getCard(this.state.selectedcard) : undefined,
                    selectedGroup: selectedgroup,
                    selectedRawCard: selectedgroup !== undefined ? selectedgroup.getRawCard(this.state.selectedcard) : undefined,
                    selection: { card: this.state.selectedcard, group: this.state.selectedgroup },
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
