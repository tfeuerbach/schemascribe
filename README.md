<p align="center">
  <img src="static/icons/json-1-64.png" width="64" alt="SchemaScribe Logo">
</p>
<h1 align="center">SchemaScribe</h1>

<p align="center">
  A simple, fast, and focused tool for generating and annotating JSON Schemas.
</p>

SchemaScribe is a lightweight, tool that converts any JSON into a JSON Schema document with a couple additional enrichments. It was built to solve a reoccuring task at my work where I would have to consistently provide Interface Control Documents (ICD) for JSON that changed frequently. Passing a JSON schema with an added description and example field for each fieldname was what I found to be the best way to keep users down range informed about the data they were working with since it is more compact than a standard ICD and can be printed quickly for transport into a SCIF. Just paste your JSON, enrich it with descriptions and examples, and download the result.

## Features

-   **Instant Conversion:** Paste JSON or drop a file to generate a base schema.
-   **Easy Annotation:** Add `description` and `example` values to any field.
-   **Live Preview:** See the schema update in real-time as you type.
-   **Simple Controls:** Toggle common schema options like `required` and `title`.
-   **Downloadable:** Get a clean, formatted `.json` file.

## Usage

The tool is designed to be self-explanatory. Open it, paste your JSON, and follow the on-screen instructions.

## Contributing

This project is open-source (MIT License). Contributions are welcome! Please feel free to open an issue for bugs or feature requests, or submit a pull request.

## Future Improvements

- [ ] JSON validator.
- [ ] Upgrade from CodeMirror 5 to CodeMirror 6 to improve editor performance and adopt modern best practices.
- [ ] Convert JavaScript to TypeScript.
- [ ] Add testing suite.