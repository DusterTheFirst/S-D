import * as React from "react";
import "react-contexify/dist/ReactContexify.min.css";
import "./App.css";
import CardGroup from "./Card/CardGroup";
import Explorer from "./Explorer/Explorer";

export const CardGroupContext = React.createContext<CardGroup[]>([]);

type SelectCardFn = (group: number, card: number) => () => void;
export const SelectCardContext = React.createContext<SelectCardFn>(() => () => null);

interface ISelection {
    card: number;
    group: number;
}
export const SelectedContext = React.createContext<ISelection>({ card: 0, group: 0 });

export default class App extends React.Component<{}, {
    groups: CardGroup[];
    selectedcard: number;
    selectedgroup: number;
}> {
    constructor(props: {}, context?: {}) {
        super(props, context);

        let cardgroup = new CardGroup("nutballs")
            .addCard({
                name: "supple"
            }).addCard({
                class: "history",
                name: "largebutt"
            }).addCard({
                name: "peenus"
            }).addCard({
                name: "aaaa"
            }).addCard({
                name: "i need help"
            }).addCard({
                name: "help i need"
            }).addCard({
                name: "homosex"
            }).addCard({
                name: "nate"
            });

        let g1 = new CardGroup("yeet")
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
                name: "whamen are property"
            });

        let g2 = new CardGroup("mohammed")
            .addCard({
                name: "de se"
            }).addCard({
                name: "succith"
            }).addCard({
                name: "mien"
            }).addCard({
                name: "gigantorum"
            }).addCard({
                name: "kamph"
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
            description: "4",
            duration: "5",
            extDescription: "6",
            image: "7",
            level: 8,
            mComponent: true,
            name: "10",
            physicalComponents: "11",
            range: "12",
            sComponent: true,
            type: "14",
            vComponent: true
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

    private readonly selectCardGenerator = (group: number, card: number) =>
        () => {
            this.setState({
                selectedcard: card,
                selectedgroup: group
            });
        }

    public render() {
        let selectedgroup = this.state.groups[this.state.selectedgroup];

        return (
            <div className="app">
                <CardGroupContext.Provider value={this.state.groups}>
                <SelectCardContext.Provider value={this.selectCardGenerator}>
                <SelectedContext.Provider value={{ card: this.state.selectedcard, group: this.state.selectedgroup }}>
                    <div className="workspace">
                        <Explorer/>
                    </div>
                    <div className="settings">
                        Full card
                        <pre>
                            {JSON.stringify(selectedgroup.getCard(this.state.selectedcard), null, 4)}
                        </pre>

                        Override values
                        <pre>
                            {JSON.stringify(selectedgroup.getRawCard(this.state.selectedcard), null, 4)}
                        </pre>

                        Default values from "{selectedgroup.name}"
                        <pre>
                            {JSON.stringify(selectedgroup.settings, null, 4)}
                        </pre>
                    </div>
                    <div className="renders">
                        <canvas className="frontview view"/>
                        <hr/>
                        <canvas className="backview view"/>
                    </div>
                </SelectedContext.Provider>
                </SelectCardContext.Provider>
                </CardGroupContext.Provider>
            </div>
        );
    }
}
