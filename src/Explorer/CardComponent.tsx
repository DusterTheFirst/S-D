import * as React from "react";
import { ContextMenuProvider } from "react-contexify";
import { CardControllerContext } from "../App";
import ICard from "../Card/Card";
import CardGroup from "../Card/CardGroup";
import Explorer, { SearchContext } from "./Explorer";

interface IProps {
    group: CardGroup;
    card: ICard;
    id: number;
    groupid: number;
    display: boolean;
}

export default class CardComponent extends React.Component<IProps> {
    public render() {
        return (
            <SearchContext.Consumer>{
                search => (
                    <CardControllerContext.Consumer>{
                        cards => (
                            <ContextMenuProvider id="card-contextmenu" data={{ card: this.props.id, group: this.props.groupid }}>
                                <div
                                    className={`card ${cards.selection.card === this.props.id && cards.selection.group === this.props.groupid ? "selected" : "notselected"}`}
                                    onClick={cards.selectGenerator(this.props.groupid, this.props.id)}
                                    style={{ display: this.props.display ? "block" : "none" }}
                                >{
                                        // Highlight any text in the card that matches the search query
                                        Explorer.highlightMatches(this.props.card.name, search)
                                    }</div>
                            </ContextMenuProvider>
                        )
                    }</CardControllerContext.Consumer>
                )
            }</SearchContext.Consumer>
        );
    }
}