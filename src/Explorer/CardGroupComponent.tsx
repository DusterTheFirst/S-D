import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ContextMenuProvider } from "react-contexify";
import { CardControllerContext } from "../App";
import ICard from "../Card/Card";
import CardGroup from "../Card/CardGroup";
import CardComponent from "./CardComponent";
import Explorer, { SearchContext } from "./Explorer";

interface IProps {
    group: CardGroup;
    id: number;
}

interface IState {
    collapsed: boolean;
}

export default class CardGroupComponent extends React.Component<IProps, IState> {

    constructor(props: IProps, context: unknown) {
        super(props, context);

        this.state = {
            collapsed: false
        };
    }

    private readonly toggleCollapse = () =>
        this.setState(prevState => ({ collapsed: !prevState.collapsed }))

    private cardFilter(filter?: string) {
        return (card: ICard) => (filter !== undefined && card.name !== undefined && card.name.toLowerCase().includes(filter.toLowerCase())) || filter === undefined;
    }

    public render() {
        return (
            <SearchContext.Consumer>{
                search => (
                    <CardControllerContext.Consumer>{
                        cards => {
                            return (
                                <ContextMenuProvider id="group-contextmenu" data={{ card: -1, group: this.props.id }}>
                                    <div className={`group ${cards.selection.card === -1 && cards.selection.group === this.props.id ? "selected" : "notselected"}`} style={{
                                        // Show the group if there are results inside of it
                                        display: search !== undefined && this.props.group.getCards().filter(this.cardFilter(search)).length > 0
                                            // OR if the group name matches the search
                                            || search !== undefined && this.props.group.name.includes(search) || search === undefined ? "block" : "none"
                                    }}>
                                        <div className="title" onClick={this.toggleCollapse}>
                                            <div className="caret">
                                                <FontAwesomeIcon icon={this.state.collapsed ? faCaretRight : faCaretDown} />
                                            </div>
                                            <div className="name">{
                                                // Highlight any text in the name that matches the search query
                                                Explorer.highlightMatches(this.props.group.name, search)
                                            }</div>
                                        </div>
                                        <div className="cards">{
                                                this.props.group.getCards()
                                                    // Map the cards to elements
                                                    .map((card, j) => {
                                                        let display =
                                                            // Show if the group name is a match and not collapsed
                                                            search !== undefined && this.props.group.name.includes(search) && !this.state.collapsed
                                                            // Or if it is a match and not collapsed
                                                            || this.cardFilter(search)(card) && !this.state.collapsed
                                                            // Or if it is selected
                                                            || j === cards.selection.card && this.props.id === cards.selection.group;

                                                        return <CardComponent key={j} card={card} group={this.props.group} id={j} groupid={this.props.id} display={display} />;
                                                    })
                                            }</div>
                                    </div>
                                </ContextMenuProvider>
                            );
                        }
                    }</CardControllerContext.Consumer>
                )
            }</SearchContext.Consumer>
        );
    }
}