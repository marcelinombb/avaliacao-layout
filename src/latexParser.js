import katex from "../node_modules/katex/dist/katex.mjs";
import { decodeHTML } from "../node_modules/entities/dist/esm/index.js";

const delimiters = [
  { left: "$$", right: "$$", display: false },
  { left: "$", right: "$", display: false },
  { left: "\\(", right: "\\)", display: false },
  { left: "\\[", right: "\\]", display: false },
];

function renderWithDelimiters(latexString, delimiters) {
  let htmlString = "";
  let position = 0;

  while (position < latexString.length) {
    let match = null;
    let matchStart = -1;
    let matchEnd = -1;
    let isDisplay = false;

    for (let delimiter of delimiters) {
      let start = latexString.indexOf(delimiter.left, position);
      if (start !== -1 && (matchStart === -1 || start < matchStart)) {
        let end = latexString.indexOf(
          delimiter.right,
          start + delimiter.left.length
        );
        if (end !== -1) {
          match = delimiter;
          matchStart = start;
          matchEnd = end;
          isDisplay = delimiter.display;
        }
      }
    }

    if (match === null) {
      htmlString += latexString.slice(position);
      break;
    }

    htmlString += latexString.slice(position, matchStart);
    let latex = latexString.slice(matchStart + match.left.length, matchEnd);

    let renderedHTML = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: isDisplay,
      output: "html",
    });
    htmlString += renderedHTML;
    position = matchEnd + match.right.length;
  }

  return htmlString;
}

function latexParser(text) {
  
  const regex = /<span class=\\*"math-tex\\*">([.\s\S]*?)<\/span>/g;

  let match;

  let dataModified = text;  
  
  while ((match = regex.exec(text)) !== null) {
    let renderFormula;
    try {
      
      renderFormula = renderWithDelimiters(
        decodeHTML(match[1]).replace(/\u00A0/g, " "),
        delimiters
      );
      dataModified = dataModified.replace(
        match[0],
        `<span class="math-tex">${renderFormula}</span>`
      );
      
    } catch (e) {
      console.log(e);
    }
  }

  return dataModified;
}

export default latexParser
