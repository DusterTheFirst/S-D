import * as React from "react";
import { ContextMenuProvider } from "../../node_modules/react-contexify";
import { SelectCardContext, SelectedContext } from "../App";
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
                    <SelectedContext.Consumer>{
                        selected => (
                            <SelectCardContext.Consumer>{
                                select => (
                                    <ContextMenuProvider id="card-contextmenu">
                                        <div
                                            className={`card ${selected.card === this.props.id && selected.group === this.props.groupid ? "selected": "notselected"}`}
                                            onClick={select(this.props.groupid, this.props.id)}
                                            style={{display: this.props.display ? "block" : "none"}}
                                        >{
                                            // Highlight any text in the card that matches the search query
                                            Explorer.highlightMatches(this.props.card.name, search)
                                        }</div>
                                    </ContextMenuProvider>
                                )
                            }</SelectCardContext.Consumer>
                        )
                    }</SelectedContext.Consumer>
                )
            }</SearchContext.Consumer>
        );
    }
}