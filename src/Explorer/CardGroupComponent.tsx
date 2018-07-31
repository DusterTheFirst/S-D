import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ContextMenu, ContextMenuProvider, Item, Separator } from "react-contexify";
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
    constructor(props: IProps, context: {}) {
        super(props, context);

        this.state = {
            collapsed: false
        };
    }

    private readonly toggleCollapse = () =>
        this.setState({ collapsed: !this.state.collapsed })

    private cardFilter(filter?: string) {
        return (card: ICard) => (filter && card.name && card.name.toLowerCase().includes(filter.toLowerCase())) || !filter;
    }

    public render() {
        return (
            <SearchContext.Consumer>{
                search => [
                    <ContextMenuProvider id={`contextmenu-${this.props.id}`} key={0}>
                        <div className="group" style={{
                            // Show the group if there are results inside of it
                            display: this.props.group.getCards().filter(this.cardFilter(search)).length > 0
                                // OR if the group name matches the search
                                || search && this.props.group.name.includes(search) ? "block" : "none"
                        }}>
                            <div className="title" onClick={!search ? this.toggleCollapse : undefined}>
                                <div className="caret">
                                    <FontAwesomeIcon icon={this.state.collapsed ? faCaretRight : faCaretDown}/>
                                </div>
                                <div className="name">{
                                    // Highlight any text in the name that matches the search query
                                    Explorer.highlightMatches(this.props.group.name, search)
                                }</div>
                            </div>
                            <div className="cards" style={{
                                display: this.state.collapsed ? "none" : ""
                            }}>{
                                this.props.group.getCards()
                                    // Map the cards to elements
                                    .map((card, j) => {
                                        let display =
                                        // Show if the group name is a match
                                        search && this.props.group.name.includes(search)
                                        // Or if it is a match
                                        || this.cardFilter(search)(card);

                                        return <CardComponent key={j} card={card} group={this.props.group} id={j} groupid={this.props.id} display={display}/>;
                                    })
                            }</div>
                        </div>
                    </ContextMenuProvider>,
                    <ContextMenu id={`contextmenu-${this.props.id}`} key={1}>
                        <Item>Edit</Item>
                        <Separator/>
                        <Item>Delete</Item>
                    </ContextMenu>
                ]
            }</SearchContext.Consumer>
        );
    }
}