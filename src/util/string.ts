/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

/** Add a suffix to a number */
export function ordinalSuffixOf(i: number) {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) {
        return `${i}st`;
    }
    if (j === 2 && k !== 12) {
        return `${i}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${i}rd`;
    } else {
        return `${i}th`;
    }
}

/** Replace `- ` and `* ` with a bullet */
export function bulletLists(text: string): string {
    return text.replace(/^(\*|-)(?= )/img, "\u2022");
}