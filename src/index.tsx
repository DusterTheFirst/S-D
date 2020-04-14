/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

// tslint:disable-next-line: no-import-side-effect
import { configure } from "mobx";
import "mobx-react-lite/batchingForReactDom";
import React from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import App from "./App";
import "./index.scss";
import registerServiceWorker from "./registerServiceWorker";

ReactModal.setAppElement("#root");

ReactDOM.render(
    <App />,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();

document.oncontextmenu = (e) => {
    e.preventDefault();
};

configure({
    computedRequiresReaction: true,
    enforceActions: "observed",
    observableRequiresReaction: true,
    reactionRequiresObservable: true,
});