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

/** Hash a string */
export function hashCode(s: string) {
    let hash = 0;
    let chr;
    for (let i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr; // tslint:disable-line no-bitwise
        hash |= 0; // tslint:disable-line no-bitwise // Convert to 32bit integer
    }

    return hash;
}
