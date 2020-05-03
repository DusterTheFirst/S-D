/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import React, { useEffect, useState } from "react";
import { dataFileReaderAsync } from "../../util/file";

/** Style section for the svgs */
export default function SVGStyle() {
    const [fonts, setFonts] = useState<[string, string]>();

    useEffect(() => {
        Promise.all([
            fetch("/fonts/Modesto-Expd.woff2").then(x => x.blob()).then(dataFileReaderAsync),
            fetch("/fonts/Modesto-Regular.woff2").then(x => x.blob()).then(dataFileReaderAsync)
        ]).then(([a, b]) => {
            setFonts([a, b]);
        }).catch(e => console.error(e));
    }, []);

    if (fonts === undefined) {
        return null;
    }

    const [ModestoRegular, ModestoExpd] = fonts;

    const style = `
        @font-face {
            font-family: "Modesto-Expd";
            src: url("${ModestoRegular}");
        }

        @font-face {
            font-family: "Modesto-Regular";
            src: url("${ModestoExpd}");
        }
    `;

    return (
        <style>{style}</style>
    );
}