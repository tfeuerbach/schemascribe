import { generateSchema } from './schema-logic.js';
import * as UI from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentSchema = null;

    /**
     * Builds the final schema object by applying user-selected options.
     * @param {boolean} fromInputView - Whether to use controls from the initial input view.
     * @returns {object|null} The generated schema or null if input is invalid.
     */
    function buildSchemaWithOptions(fromInputView = false) {
        const jsonString = UI.inputEditor.getValue();
        if (!jsonString.trim()) {
            alert('Please paste or upload a JSON object.');
            return null;
        }

        try {
            const jsonObj = JSON.parse(jsonString);
            let schema = generateSchema(jsonObj);

            const useSchema = fromInputView ? UI.DOM.schemaCheckbox.checked : UI.DOM.schemaCheckboxAnno.checked;
            const useId = fromInputView ? UI.DOM.idCheckbox.checked : UI.DOM.idCheckboxAnno.checked;
            const useRequired = fromInputView ? UI.DOM.requiredCheckbox.checked : UI.DOM.requiredCheckboxAnno.checked;
            const title = fromInputView ? UI.DOM.titleInput.value : UI.DOM.titleInputAnno.value;

            if (useSchema) {
                schema['$schema'] = 'http://json-schema.org/draft-04/schema#';
            }
            if (useId) {
                schema['$id'] = 'https://schemascribe.tfeuerbach.dev/schema.json';
            }
            schema['title'] = title.trim() || 'Generated JSON Schema';

            if (!useRequired) {
                const stripRequired = (node) => {
                    if (node && typeof node === 'object') {
                        delete node.required;
                        Object.values(node.properties || {}).forEach(stripRequired);
                        if (node.items) stripRequired(node.items);
                        if (node.anyOf) node.anyOf.forEach(stripRequired);
                    }
                };
                stripRequired(schema);
            }
            return schema;
        } catch (error) {
            alert(`Invalid JSON: ${error.message}`);
            return null;
        }
    }

    /**
     * Updates the schema based on user input in the annotation form.
     * @param {Event} event The input event from a form field.
     */
    function updateSchemaFromForm(event) {
        if (!currentSchema) return;

        const path = event.target.dataset.path;
        const field = event.target.dataset.field;
        let value = event.target.value;

        if (!path || !field) return;

        try {
            const keys = path.split('.');
            let target = currentSchema;
            for (let i = 0; i < keys.length; i++) {
                if (target[keys[i]] === undefined) {
                    console.error(`Invalid path: ${path}`);
                    return;
                }
                target = target[keys[i]];
            }
            
            if (field === 'examples') {
                target[field] = value.split(',').map(s => s.trim()).filter(Boolean);
            } else {
                target[field] = value;
            }

            UI.displaySchema(currentSchema);

        } catch (e) {
            console.error("Failed to update schema at path:", path, e);
        }
    }

    /**
     * Handles the main "Generate Schema" button click.
     */
    UI.DOM.generateBtn.addEventListener('click', () => {
        const schema = buildSchemaWithOptions(true);
        if (!schema) return;

        currentSchema = schema;

        UI.DOM.requiredCheckboxAnno.checked = UI.DOM.requiredCheckbox.checked;
        UI.DOM.schemaCheckboxAnno.checked = UI.DOM.schemaCheckbox.checked;
        UI.DOM.idCheckboxAnno.checked = UI.DOM.idCheckbox.checked;
        UI.DOM.titleInputAnno.value = UI.DOM.titleInput.value;

        UI.displaySchema(currentSchema);
        UI.createEditForm(currentSchema);
        UI.DOM.downloadBtn.disabled = false;
        UI.animateToAnnotation();
    });

    /**
     * Handles the "Back" button click to return to the input view.
     */
    UI.DOM.backBtn.addEventListener('click', () => {
        UI.animateBack();
        UI.DOM.downloadBtn.disabled = true;
    });

    /**
     * Handles downloading the current schema as a JSON file.
     */
    UI.DOM.downloadBtn.addEventListener('click', () => {
        if (!currentSchema) return;
        const blob = new Blob([UI.outputEditor.getValue()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const title = currentSchema.title || 'schema';
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
        }, 0);
    });

    /**
     * Rerenders the schema when annotation options change.
     */
    function rerenderSchemaWithOptions() {
        if (!currentSchema) return;
        const newSchema = buildSchemaWithOptions();
        if (newSchema) {
            const formInputs = UI.DOM.editFormContainer.querySelectorAll('input[data-path]');
            formInputs.forEach(input => {
                const path = input.dataset.path;
                const field = input.dataset.field;
                const value = input.value;
                try {
                    const keys = path.split('.');
                    let target = newSchema;
                    for (const key of keys) {
                        target = target[key];
                    }
                    if (field === 'examples') {
                         target[field] = value.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                        target[field] = value;
                    }
                } catch(e) {
                    console.error("Could not preserve value for", path, field);
                }
            });
            currentSchema = newSchema;
            UI.displaySchema(currentSchema);
        }
    }

    [UI.DOM.requiredCheckboxAnno, UI.DOM.schemaCheckboxAnno, UI.DOM.idCheckboxAnno].forEach(el => {
        el.addEventListener('change', rerenderSchemaWithOptions);
    });
    UI.DOM.titleInputAnno.addEventListener('input', rerenderSchemaWithOptions);
    
    UI.DOM.editFormContainer.addEventListener('input', updateSchemaFromForm);

    function handleFile(file) {
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (event) => UI.inputEditor.setValue(event.target.result);
            reader.readAsText(file);
        } else {
            alert('Please drop a valid JSON file.');
        }
    }

    UI.DOM.dropZone.addEventListener('click', () => UI.DOM.fileInput.click());
    UI.DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
    UI.DOM.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        UI.DOM.dropZone.classList.add('drag-over');
    });
    UI.DOM.dropZone.addEventListener('dragleave', () => {
        UI.DOM.dropZone.classList.remove('drag-over');
    });
    UI.DOM.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        UI.DOM.dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
});

