/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

import { useEffect, useState } from "react";
import { dataFileReaderAsync } from "../../util/file";

/** Style section for the svgs */
export default function useEmbeddedFont() {
    const [fonts, setFonts] = useState<[string, string, string, string]>();

    useEffect(() => {
        Promise.all([
            fetch("/fonts/Modesto-Expd.ttf")
                .then(x => x.blob())
                .then(dataFileReaderAsync),
            fetch("/fonts/Modesto-Regular.ttf")
                .then(x => x.blob())
                .then(dataFileReaderAsync),
            fetch("/fonts/OpenSans-Regular.ttf")
                .then(x => x.blob())
                .then(dataFileReaderAsync),
            fetch("/fonts/OpenSans-SemiBold.ttf")
                .then(x => x.blob())
                .then(dataFileReaderAsync)
        ]).then(setFonts)
            .catch(e => console.error(e));
    }, []);

    if (fonts === undefined) {
        return null;
    }

    const [ModestoRegular, ModestoExpd, OpenSansRegular, OpenSansSemiBold] = fonts;

    return `
        @font-face {
            font-family: "Modesto-Expd";
            src: url("${ModestoRegular}");
        }

        @font-face {
            font-family: "Modesto-Regular";
            src: url("${ModestoExpd}");
        }

        @font-face {
            font-family: "Open Sans";
            src: url("${OpenSansRegular}");
        }

        @font-face {
            font-family: "Open Sans SemiBold";
            src: url("${OpenSansSemiBold}");
        }
    `;
}