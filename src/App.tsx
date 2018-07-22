import * as React from "react";
import "./App.css";
import Card from "./Card";

class App extends React.Component<{}, { cards: Card[] }> {
    public render() {
        return (
            <div className="app">
                <div className="workspace">
                    this is the workspace
                </div>
                <div className="settings">
                    these are the card settings
                </div>
                <div className="cards">
                    <div className="front">
                        this is the front of the card
                    </div>
                    <div className="back">
                        this is the back of the card
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
