/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

/** Helper function to achieve word wrapping */
export function wordWrapSVG(text: string, width: number, outputElement: SVGTextElement) {
    return text.replace("\r", "").split("\n").map((x, i) => wordWrapOneLineSVG(x, width, outputElement, i !== 0)).reduce((a, b) => a + b);
}

/** Helper Function to wrap one continuous line of text in an svg */
function wordWrapOneLineSVG(text: string, width: number, outputElement: SVGTextElement, initialOffset = false) {
    const words = text.split(" ");
    let elementCount = 0;

    let tspanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");   // Create first tspan element
    let textNode = document.createTextNode(words[0]);           // Create text in tspan element

    if (initialOffset) {
        tspanElement.setAttribute("x", outputElement.x.baseVal[0].valueAsString);
        tspanElement.setAttribute("dy", outputElement.attributes.getNamedItem("font-size")?.value ?? "");

        elementCount++;
    }

    tspanElement.appendChild(textNode);                     // Add tspan element to DOM
    outputElement.appendChild(tspanElement);                        // Add text to tspan element

    if (!words.some(x => x.length > 0)) {
        tspanElement.textContent = "\x20";

        return parseFloat(outputElement.attributes.getNamedItem("font-size")?.value ?? "0");
    }

    for (let i = 1; i < words.length; i++) {
        if (tspanElement.firstChild === null || tspanElement.firstChild.textContent === null) {
            console.error("TSPAN element has no first child", tspanElement);

            return elementCount * parseFloat(outputElement.attributes.getNamedItem("font-size")?.value ?? "0");
        }

        const len = tspanElement.firstChild?.textContent?.length;             // Find number of letters in string
        tspanElement.firstChild.textContent += ` ${words[i]}`;            // Add next word

        if (tspanElement.getComputedTextLength() > width) {
            tspanElement.firstChild.textContent = tspanElement.firstChild.textContent.slice(0, len);    // Remove added word

            tspanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");       // Create new tspan element
            tspanElement.setAttribute("x", outputElement.x.baseVal[0].valueAsString);
            tspanElement.setAttribute("dy", outputElement.attributes.getNamedItem("font-size")?.value ?? "");
            textNode = document.createTextNode(words[i]);

            tspanElement.appendChild(textNode);
            outputElement.appendChild(tspanElement);

            elementCount++;
        }
    }

    return elementCount * parseFloat(outputElement.attributes.getNamedItem("font-size")?.value ?? "0");
}