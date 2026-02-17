# Handlebars Integration in Avaliacao Layout

This project now uses [Handlebars](https://handlebarsjs.com/) for rendering questions and other components. This separation of logic and presentation improves code maintainability and customization.

## Directory Structure

*   `src/rendering/templates/`: Contains the `.hbs` template files.
*   `src/rendering/Hbs.ts`: Main entry point for Handlebars setup, helper registration, and template usage.
*   `src/declarations.d.ts`: TypeScript declarations to allow importing `.hbs` files as precompiled templates.

## Templates

The following templates are available:

*   **question.hbs**: The main container for a question.
*   **header.hbs**: Renders the question header (order, value).
*   **reference.hbs**: Renders the reference text and source.
*   **body.hbs**: Renders the main content of the question, handling different types (Open, Multiple Choice, etc.).
*   **alternatives.hbs**: Renders the list of alternatives for multiple-choice questions.
*   **statements.hbs**: Renders statements (afirmações).
*   **associations.hbs**: Renders association columns.
*   **assertions.hbs**: Renders assertions (assercões).
*   **responseBox.hbs**: Renders the answer box (quadro de resposta).

## Custom Helpers

Several custom helpers have been implemented to support the layout requirements:

### `repeat`
Repeats a string a specified number of times.
```hbs
{{{repeat "<br>" 3}}}
```

### `formatHeader`
Formats the question header based on the template, order, and value.
```hbs
{{formatHeader headerTemplate1 headerTemplate2 order displayOrder value}}
```

### `renderResponseBox`
Renders the answer box HTML based on type and number of lines.
```hbs
{{{renderResponseBox typeCode numLines}}}
```

### `formatAlternativeIndex`
Converts an index (0, 1, 2) to the corresponding alternative label (A, B, C or a, b, c, etc.) based on the configuration.
```hbs
{{formatAlternativeIndex @index type}}
```

### `switch`, `case`, `default`
Implements switch-case logic within templates.
```hbs
{{#switch type}}
  {{#case 'TypeA'}} ... {{/case}}
  {{#case 'TypeB'}} ... {{/case}}
  {{#default}} ... {{/default}}
{{/switch}}
```

## How to Modify

To change the HTML structure of a question, modify the corresponding `.hbs` file in `src/rendering/templates/`. The project is configured to watch for changes in `.hbs` files. When you save a change, the build process will automatically recompile the template and reload the browser if run in dev mode.

You do not need to touch the TypeScript code unless you are adding new data or logic.

## Build Configuration

The project uses a custom Rollup plugin (`hbs-precompile` in `rollup.config.js`) to precompile templates. 
This means `.hbs` files are transformed into JavaScript modules that export the compiled template function.

At runtime, the application imports `handlebars/runtime` (a lighter version of Handlebars without the compiler) to execute these precompiled templates. This improves performance and reduces the bundle size.
