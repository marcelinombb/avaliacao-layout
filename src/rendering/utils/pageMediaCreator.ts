export function createPageMedia(config: Record<string, any>): string {
    let css = '@page {\n';

    for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'object' && value !== null) {
            css += `    ${key} {\n`;
            for (const [subKey, subValue] of Object.entries(value)) {
                css += `        ${subKey}: ${subValue};\n`;
            }
            css += `    }\n\n`;
        } else {
            css += `    ${key}: ${value};\n`;
        }
    }

    css += '}\n';
    return css;
}
