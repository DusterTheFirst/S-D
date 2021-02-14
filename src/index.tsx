/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import App from "./App";

ReactModal.setAppElement("#root");

ReactDOM.render(
    <App />,
    document.getElementById("root") as HTMLElement
);