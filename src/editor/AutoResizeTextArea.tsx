/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React, { memo, useCallback, useEffect, useRef } from "react";
import { EditorTextArea } from "../styles/editor";

/** A text area that resizes when it overflows */
const AutoResizeTextArea = memo((props: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    const resize = useCallback(() => {
        if (ref.current === null) {
            return;
        }

        ref.current.style.height = "1px";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
    }, [ref]);

    useEffect(() => {
        resize();

        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, [resize, props.value]);

    return <EditorTextArea {...props} ref={ref} onKeyUp={resize} />;
});

export default AutoResizeTextArea;