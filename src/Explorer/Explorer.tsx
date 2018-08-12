import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ContextMenu, Item, ItemCallback, Separator } from "react-contexify";
import * as ReactModal from "react-modal";
import { CardControllerContext, ICardController, ISelection} from "../App";
import CardGroup, { ICardGroup } from "../Card/CardGroup";
import { download, textFileReaderAsync } from "../Util";
import CardGroupComponent from "./CardGroupComponent";
import "./Explorer.css";

interface IState {
    search?: string;
    isTop: boolean;
    dragOver: boolean;
    deleteModal?: ISelection;
}

export const SearchContext = React.createContext<string | undefined>(undefined);

export const ModalStyles: { content: React.CSSProperties; overlay: React.CSSProperties} = {
    content: {
        background: "#1a1a1a",
        border: "solid 1px #666666",
        color: "#b8b8b8",
        height: "150px",
        left: "50%",
        maxHeight: "calc(100% - 40px)",
        maxWidth: "calc(100% - 40px)",
        minHeight: "100px",
        minWidth: "100px",
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
    },
    overlay: {
        background: "#000000AA"
    }
};

export default class Explorer extends React.Component<unknown, IState> {
    private readonly searchRef: React.RefObject<HTMLInputElement>;

    constructor(props: unknown, context?: unknown) {
        super(props, context);

        this.state = {
            dragOver: false,
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
        if (match !== undefined) {
            // Split on higlight term and include term into parts, ignore case
            return text !== undefined ? text.split(new RegExp(`(${match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"))
                .map((part, i) => (
                    // If the part is the same as the search term, give it the class highlight
                    <span className={part.toLowerCase() === match.toLowerCase() ? "highlight" : ""} key={i}>
                        {part}
                    </span>
                )) : null;
        } else {
            return text;
        }
    }

    private readonly clearSearch = () => {
        if (this.searchRef.current !== null) {
            this.searchRef.current.value = "";

            this.setState({
                search: undefined
            });
        }
    }

    private readonly addGroupGenerator = (cards: ICardController, group: CardGroup) => () => {
        cards.addGroup(group);
        cards.select(cards.groups.length);
    }

    private readonly onDrop = (cards: ICardController) =>
        async (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.persist();

            this.setState({
                dragOver: false
            });

            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                let file = event.dataTransfer.files[i];

                if (file.type === "application/json" || file.name.endsWith(".json")) {
                    let contents = await textFileReaderAsync(file);

                    let group = new CardGroup(JSON.parse(contents) as ICardGroup);

                    cards.addGroup(group);
                    cards.select(cards.groups.length);
                } else {
                    console.exception(`Format "${file.type}" unrecognised`);
                }
            }

            event.dataTransfer.items.clear();
        }

    private readonly onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (this.state.deleteModal === undefined) {
            event.preventDefault();
        }
    }

    private readonly onDragEnter = (event: React.DragEvent<HTMLDivElement>) =>
        this.setState(prevState => ({
            dragOver: prevState.deleteModal === undefined
        }))

    private readonly onDragExit = (event: React.DragEvent<HTMLDivElement>) =>
        this.setState({
            dragOver: false
        })

    public render() {
        return (
            <CardControllerContext.Consumer>{
                cards => (
                    <div className="explorer">
                        {/* Search results */}
                        <div className={`children ${this.state.dragOver ? "dragover" : "nodragover"}`} onScroll={this.onScroll} onDrop={this.onDrop(cards)} onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragExit={this.onDragExit}>
                            <SearchContext.Provider value={this.state.search}>{
                                // Map the array of groups to arrays of elements
                                cards.groups.map((group, i) => {
                                    if (group !== undefined) {
                                        return <CardGroupComponent key={i} group={group} id={i}/>;
                                    } else {
                                        return undefined;
                                    }
                                })
                            }</SearchContext.Provider>

                            {/* Group context menu */}
                            <ContextMenu id="group-contextmenu">
                                <Item onClick={this.groupContextEditClick} data={cards}>Edit</Item>
                                <Item onClick={this.groupContextAddClick} data={cards}>Add Card</Item>
                                <Separator />
                                <Item onClick={this.groupContextDownloadClick} data={cards}>Download</Item>
                                <Item disabled={true}>Render All</Item>
                                <Item disabled={true}>Print All</Item>
                                <Separator />
                                <Item className="delete" onClick={this.contextDeleteClick} data={cards}>Delete</Item>
                            </ContextMenu>

                            {/* Card context menu */}
                            <ContextMenu id="card-contextmenu">
                                <Item onClick={this.cardContextDuplicateClick} data={cards}>Duplicate</Item>
                                <Separator />
                                <Item onClick={this.cardContextUpClick} data={cards} disabled={this.cardContextUpDisable}>Move Up</Item>
                                <Item onClick={this.cardContextDownClick} data={cards} disabled={this.cardContextDownDisable}>Move Down</Item>
                                <Separator />
                                <Item className="delete" onClick={this.contextDeleteClick} data={cards}>Delete</Item>
                            </ContextMenu>

                            <ReactModal isOpen={this.state.deleteModal !== undefined} style={ModalStyles}>
                                <div className="modal">{(()=>{
                                        if (this.state.deleteModal === undefined) {
                                            return (
                                                <div className="error">
                                                    You really messed up if you can see this
                                                </div>
                                            );
                                        }

                                        let cardid = this.state.deleteModal.card;
                                        let groupid = this.state.deleteModal.group;

                                        let group = cards.groups[groupid];

                                        if (group !== undefined) {
                                            let card = group.getCard(cardid);

                                            return (
                                                <div className="dialog">
                                                    Are you sure you want to delete
                                                    {
                                                        cardid !== -1
                                                        ? <span className="info"> <span className="type">card</span> <span className="name">{card.name}</span></span>
                                                        : <span className="info"> <span className="type">group</span> <span className="name">{group.name}</span> and all of its cards</span>
                                                    }
                                                    ?
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="error">
                                                    You really messed up if you can see this
                                                </div>
                                            );
                                        }
                                    })()}
                                    <div className="warn">
                                        This action is <span className="irreversible">irreversible</span>
                                    </div>
                                    <div className="buttons">
                                        <button onClick={this.closeDeleteModal}>Cancel</button>
                                        <button className="delete" onClick={this.deleteCardgenerator(cards, this.state.deleteModal)}>Delete</button>
                                    </div>
                                </div>
                            </ReactModal>
                        </div>
                        {/* Header */}
                        <div className={`head ${(this.state.isTop ? "top" : "scrolled")}`}>
                            <div className="search">
                                <input type="text" onChange={this.searchChange} className={this.state.search !== undefined ? "short" : ""} ref={this.searchRef} />
                                <div className="x" style={{ display: this.state.search !== undefined ? "" : "none" }} onClick={this.clearSearch}><FontAwesomeIcon icon={faTimes} /></div>
                            </div>
                            <div className="add" onClick={this.addGroupGenerator(cards, new CardGroup({name: `New Group ${cards.groups.length}`}))}><FontAwesomeIcon icon={faPlus} /></div>
                        </div>
                    </div>
                )
            }</CardControllerContext.Consumer>
        );
    }

    private readonly closeDeleteModal = () =>
        this.setState({
            deleteModal: undefined
        })

    private readonly groupContextDownloadClick = (info: ItemCallback) => {
        let { selectedGroup } = info.data as ICardController;

        let str = JSON.stringify(selectedGroup);

        if (selectedGroup !== undefined) {
            download(new Blob([str], {type: "application/json"}), `${selectedGroup.name}.json`);
        }
    }

    private readonly groupContextAddClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;
        let { addCard, select, selectedGroup } = info.data as ICardController;

        if (selectedGroup !== undefined) {
            addCard(selection.group);
            select(selection.group, selectedGroup.getRawCards().length);
        }
    }

    private readonly groupContextEditClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;
        let { select } = info.data as ICardController;

        select(selection.group, selection.card);
    }

    private readonly contextDeleteClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;

        this.setState({
            deleteModal: {
                card: selection.card,
                group: selection.group
            }
        });
    }
    private deleteCardgenerator({removeGroup, removeCard}: ICardController, selection?: ISelection) {
        if (selection === undefined) {
            return () =>
                this.setState({
                    deleteModal: undefined
                });
        } else if (selection.card === -1) {
            return () => {
                this.setState({
                    deleteModal: undefined
                });
                removeGroup(selection.group);
            };
        } else {
            return () => {
                this.setState({
                    deleteModal: undefined
                });
                removeCard(selection.group, selection.card);
            };
        }
    }

    private readonly cardContextDuplicateClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;
        let { addCard, select, selectedGroup } = info.data as ICardController;

        if (selectedGroup !== undefined) {
            addCard(selection.group, selectedGroup.getRawCard(selection.card));
            select(selection.group,  selectedGroup.getRawCards().length);
        }
    }

    private readonly cardContextUpClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;
        let { moveCard, select } = info.data as ICardController;

        moveCard(selection.group, selection.card, selection.card - 1);
        select(selection.group, selection.card - 1);
    }

    private readonly cardContextDownClick = (info: ItemCallback) => {
        let selection = info.dataFromProvider as ISelection;
        let { moveCard, select } = info.data as ICardController;

        moveCard(selection.group, selection.card, selection.card + 1);
        select(selection.group, selection.card + 1);
    }

    private readonly cardContextUpDisable = (info: ItemCallback): boolean => {
        let selection = info.dataFromProvider as ISelection;
        let { } = info.data as ICardController;

        return selection.card === 0;
    }

    private readonly cardContextDownDisable = (info: ItemCallback): boolean => {
        let selection = info.dataFromProvider as ISelection;
        let { selectedGroup } = info.data as ICardController;

        if (selectedGroup !== undefined) {
            return selection.card === selectedGroup.getRawCards().length - 1;
        } else {
            return true;
        }
    }
}