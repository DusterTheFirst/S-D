import * as React from "react";
import {  } from "react-contexify";
import { faTimes } from "../../node_modules/@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "../../node_modules/@fortawesome/react-fontawesome";
import { CardGroupContext } from "../App";
import CardGroupComponent from "./CardGroupComponent";
import "./Explorer.css";

interface IState {
    search?: string;
    isTop: boolean;
}

export const SearchContext = React.createContext<string | undefined>(undefined);

export default class Explorer extends React.Component<{}, IState> {
    private readonly searchRef: React.RefObject<HTMLInputElement>;

    constructor(props: {}, context?: {}) {
        super(props, context);

        this.state = {
            isTop: true,
        };

        this.searchRef = React.createRef<HTMLInputElement>();
    }

    /** Listen to the search query changing */
    private readonly searchChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            search: event.currentTarget.value
        });
    }

    /** Listen for scroll */
    private readonly onScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (this.state.isTop !== event.currentTarget.scrollTop < 30) {
            this.setState({
                isTop: event.currentTarget.scrollTop < 30
            });
        }
    }

    /** Highlight the matches to the match string */
    public static highlightMatches(text?: string, match?: string) {
        // Only spend time spliting if there is a match to look for
        if (match) {
            // Split on higlight term and include term into parts, ignore case
            return text && text.split(new RegExp(`(${match && match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"))
            .map((part, i) => (
                // If the part is the same as the search term, give it the class highlight
                <span className={match && part.toLowerCase() === match.toLowerCase() ? "highlight" : ""} key={i}>
                    {part}
                </span>
            ));
        } else {
            return text;
        }
    }

    private readonly clearSearch = () => {
        if (this.searchRef.current) {
            this.searchRef.current.value = "";

            this.setState({
                search: undefined
            });
        }
    }

    public render() {
        return (
            <div className="explorer">
                {/* Search bar */}
                <div className={`search ${(this.state.isTop ? "top" : "scrolled")}`}>
                    <input type="text" onChange={this.searchChange} className={this.state.search ? "short" : ""} ref={this.searchRef}/>
                    <div className="x" style={{display: this.state.search ? "" : "none"}} onClick={this.clearSearch}><FontAwesomeIcon icon={faTimes}/></div>
                </div>
                {/* Search results */}
                <div className="children" onScroll={this.onScroll}>
                    <SearchContext.Provider value={this.state.search}>
                        <CardGroupContext.Consumer>
                            { groups =>
                                // Map the array of groups to arrays of elements
                                groups.map((group, i) => (
                                    <CardGroupComponent key={i} group={group} id={i}/>
                                ))
                            }
                        </CardGroupContext.Consumer>
                    </SearchContext.Provider>
                </div>
            </div>
        );
    }
}