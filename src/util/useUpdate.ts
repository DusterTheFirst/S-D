/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useEffect } from "react";

/** The different actions a user can take to do an update */
export enum UpdateAction {
    Skip,
    Update,
    Ignore
}

/** Hook to auto refresh the page when the code has been updated */
export default function useUpdate(prompt: (hash?: string) => void) {
    useEffect(() => {
        const fn = async () => {
            console.log("%cChecking for update...", "color: goldenrod");

            const response = await fetch("/HASH.md5");

            if (!response.ok) {
                console.log("%cFailed to get md5 hash", "color: red");

                return;
            }

            const hash = await response.text();

            if (hash !== localStorage.getItem("update-hash")) {
                console.log("%cChanges found, prompting user", "color: purple");

                prompt(hash);
            } else {
                console.log("%cNo changes!", "color: green");
            }
        };

        const interval = setInterval(fn, 10 * 60 * 1000);

        fn().catch();

        return () => clearInterval(interval);
    }, [prompt]);

    return (action: UpdateAction, hash: string) => {
        if (action === UpdateAction.Update) {
            console.log("%cUser accepting update, updating stored hash and reloading", "color: goldenrod");
            localStorage.setItem("update-hash", hash);
            location.reload(); // eslint-disable-line
        } else if (action === UpdateAction.Skip) {
            console.log("%cUser skipping update, updating stored hash with no reload", "color: goldenrod");
            localStorage.setItem("update-hash", hash);
        } else {
            console.log("%cUser ignoring update, reminding in 10 minutes", "color: goldenrod");
        }

        // Hide prompt
        prompt();
    };
}