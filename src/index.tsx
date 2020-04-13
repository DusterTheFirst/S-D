/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";
import App from "./App";
import "./index.css";
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