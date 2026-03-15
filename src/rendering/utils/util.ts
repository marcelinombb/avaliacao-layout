function toRoman(num) {
  if (num < 1 || num > 3999) return "Number out of range";

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";

  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }

  return result;
}

const numberToLetter = (number, lowerCase = false) => {
  const letter = String.fromCharCode(65 + number);
  return lowerCase ? letter.toLowerCase() : letter;
};

function conversorDeIndicesParaAlternativas(indice, tipoColuna) {
  switch (tipoColuna) {
    case 1:
      return String(indice + 1);
    case 2:
      return toRoman(indice + 1) + ".";
    case 3:
      return numberToLetter(indice, true) + ".";
    case 4:
      return numberToLetter(indice) + ".";
    case 5:
      return numberToLetter(indice, true) + ")";
    case 6:
      return numberToLetter(indice) + ")";
    case 7:
      return `(${numberToLetter(indice)})`;
    case 8:
      return `${numberToLetter(indice)} (&nbsp;&nbsp;&nbsp;)`;
    case 9:
      return `<div class="item_enem" style="vertical-align:middle;border-radius:50%;width:18px;height:18px;background:black;color:white;display:table-cell;text-align:center;" >${numberToLetter(
        indice
      )}</div>`;
    case 10:
      return "";
    default:
      return indice;
  }
}

function replacePlaceholders(html: string, placeholders: Record<string, string>) {
  if (!html) return "";

  let replacedString = html;
  for (const placeholder in placeholders) {
    replacedString = replacedString.replaceAll(
      placeholder,
      placeholders[placeholder] ?? "&nbsp;"
    );
  }

  return replacedString;
}

function shuffleAndMultiply(arr, multiplier) {
  // Shuffle group order
  const chunks = Array(multiplier).fill(arr).map(a => [...a]);
  for (let i = chunks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
  }

  // Flatten
  const multipliedArray = chunks.flat();

  // Shuffle all elements
  for (let i = multipliedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [multipliedArray[i], multipliedArray[j]] = [multipliedArray[j], multipliedArray[i]];
  }

  return multipliedArray;
}

export {
  shuffleAndMultiply,
  replacePlaceholders,
  conversorDeIndicesParaAlternativas
}