/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React, { createRef, memo, useCallback, useEffect } from "react";

/** A text area that resizes when it overflows */
const AutoResizeTextArea = memo((props: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>) => {
    const ref = createRef<HTMLTextAreaElement>();

    const resize = useCallback(() => {
        if (ref.current === null) {
            return;
        }

        ref.current.style.height = "1px";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
    }, [ref]);

    useEffect(() => {
        resize();
    }, []); // eslint-disable-line

    return <textarea {...props} ref={ref} onKeyUp={resize} />;
});

export default AutoResizeTextArea;