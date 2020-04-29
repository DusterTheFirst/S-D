/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { UIEvent, useState } from "react";

/** Hook to determine if a component is at the top */
export default function useIsTop(): [boolean, (event: UIEvent<HTMLDivElement>) => void] {
    const [isTop, setTop] = useState(true);

    /** Listen for scroll */
    const onScroll = (event: UIEvent<HTMLDivElement>) => {
        if (isTop !== (event.currentTarget.scrollTop === 0)) {
            setTop(event.currentTarget.scrollTop === 0);
        }
    };

    return [isTop, onScroll];
}