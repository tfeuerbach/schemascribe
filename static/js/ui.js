/**
 * @file Manages all DOM interactions, UI updates, and animations.
 */

// --- DOM Element References ---
export const DOM = {
    inputView: document.getElementById('input-view'),
    annotationView: document.getElementById('annotation-view'),
    generateBtn: document.getElementById('generate-btn'),
    backBtn: document.getElementById('back-btn'),
    downloadBtn: document.getElementById('download-btn'),
    requiredCheckbox: document.getElementById('include-required'),
    schemaCheckbox: document.getElementById('include-schema'),
    idCheckbox: document.getElementById('include-id'),
    deduplicateCheckbox: document.getElementById('deduplicate'),
    titleInput: document.getElementById('schema-title'),
    jsonInputContainer: document.getElementById('json-input-container'),
    schemaOutputContainer: document.getElementById('schema-output-container'),
    editFormContainer: document.getElementById('edit-form-container'),
    dropZone: document.querySelector('.drop-zone'),
    fileInput: document.getElementById('file-input'),
    requiredCheckboxAnno: document.getElementById('include-required-anno'),
    schemaCheckboxAnno: document.getElementById('include-schema-anno'),
    idCheckboxAnno: document.getElementById('include-id-anno'),
    deduplicateCheckboxAnno: document.getElementById('deduplicate-anno'),
    titleInputAnno: document.getElementById('schema-title-anno'),
};

// --- CodeMirror Setup ---
const editorOptions = {
    mode: { name: "javascript", json: true },
    theme: "material-darker",
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    autoCloseBrackets: true
};

export const inputEditor = CodeMirror(DOM.jsonInputContainer, {
    ...editorOptions,
    value: `{
  "character": {
    "name": "Grommash Hellscream",
    "realm": "Draenor",
    "class": "Warrior",
    "race": "Orc",
    "level": 60,
    "active_spec": "Arms",
    "is_online": false,
    "guild": {
      "name": "Warsong Clan",
      "rank": "Chieftain"
    }
  },
  "inventory": [
    {
      "slot": "Main Hand",
      "item_id": 28773,
      "name": "Gorehowl",
      "quality": "Legendary"
    },
    {
      "slot": "Shoulders",
      "item_id": 112935,
      "name": "Mannoroth's Tuskplates",
      "quality": "Epic"
    },
    {
      "slot": "Inventory",
      "item_id": 4500,
      "name": "Small Brown Pouch",
      "quality": "Common",
      "contains": [
        { "item_id": 6948, "name": "Hearthstone", "quality": "Common" },
        { "item_id": 3356, "name": "Briarthorn", "quality": "Common" },
        { "item_id": 2452, "name": "Fadeleaf", "quality": "Common" },
        { "item_id": 3821, "name": "Golden Sansam", "quality": "Uncommon" },
        { "item_id": 13463, "name": "Dreamfoil", "quality": "Uncommon" },
        { "item_id": 13464, "name": "Mountain Silversage", "quality": "Rare" }
      ]
    }
  ],
  "last_login_timestamps": [
    1672531200,
    1672617600
  ],
  "achievements_completed": 42
}`,
});

export const outputEditor = CodeMirror(DOM.schemaOutputContainer, {
    ...editorOptions,
    readOnly: true
});

// Automatically refresh editors on container resize.
const editorResizeObserver = new ResizeObserver(() => {
    inputEditor.refresh();
    outputEditor.refresh();
});
editorResizeObserver.observe(DOM.jsonInputContainer);
editorResizeObserver.observe(DOM.schemaOutputContainer);


// --- UI Animations & View Switching ---

/** Animates the transition to the annotation view. */
export function animateToAnnotation() {
    const tl = gsap.timeline({ defaults: { duration: 0.2, ease: 'power1.in' } });
    tl.to(DOM.inputView, { scale: 0.85, opacity: 0 })
      .set(DOM.inputView, { display: 'none' })
      .set(DOM.annotationView, { display: 'flex', scale: 0.85, opacity: 0 })
      .to(DOM.annotationView, { duration: 0.25, scale: 1, opacity: 1, ease: 'power1.out', onComplete: () => outputEditor.refresh() });
}

/** Animates the transition back to the input view. */
export function animateBack() {
    const tl = gsap.timeline({ defaults: { duration: 0.2, ease: 'power1.in' } });
    tl.to(DOM.annotationView, { scale: 0.85, opacity: 0 })
      .set(DOM.annotationView, { display: 'none' })
      .set(DOM.inputView, { display: 'flex', scale: 0.85, opacity: 0 })
      .to(DOM.inputView, { duration: 0.25, scale: 1, opacity: 1, ease: 'power1.out', onComplete: () => inputEditor.refresh() });
}


// --- Schema Display and Form Generation ---

/**
 * Recursively orders object keys for consistent, readable display.
 * @param {*} obj The object or array to process.
 * @returns {*} The processed object with ordered keys.
 */
function orderObject(obj) {
    if (Array.isArray(obj)) return obj.map(orderObject);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        const ordered = {};
        // Define a priority list for keys.
        const priorityKeys = ['type', 'description', 'examples', 'items', 'properties', 'required', 'anyOf'];
        
        priorityKeys.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                ordered[key] = orderObject(obj[key]);
            }
        });

        // Use original key order instead of alphabetical sorting.
        Object.keys(obj).forEach(key => {
            if (!priorityKeys.includes(key)) {
                ordered[key] = orderObject(obj[key]);
            }
        });

        return ordered;
    }
    return obj;
}


/**
 * Renders the JSON schema in the output editor with specific top-level key ordering.
 * @param {object} schema The schema to display.
 */
export function displaySchema(schema) {
    const orderedSchema = {};
    const topLevelPriorityKeys = ['$schema', 'title', '$id', 'description', 'type'];

    // Handle priority keys first, in the correct order.
    topLevelPriorityKeys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(schema, key)) {
            // Recursively order the children of each property.
            orderedSchema[key] = orderObject(schema[key]);
        }
    });

    // Handle the rest of the keys, also ensuring their children are ordered.
    Object.keys(schema).forEach(key => {
        if (!topLevelPriorityKeys.includes(key)) {
            if (Object.prototype.hasOwnProperty.call(schema, key)) {
                 orderedSchema[key] = orderObject(schema[key]);
            }
        }
    });

    outputEditor.setValue(JSON.stringify(orderedSchema, null, 2));
}

/**
 * Creates form inputs for a schema property (description, examples).
 * @param {HTMLElement} parentElement - The element to append inputs to.
 * @param {object} property - The JSON schema property object.
 * @param {string} path - The dot-notation path to this property.
 */
function createPropertyInputs(parentElement, property, path) {
    // Description Input
    const descriptionLabel = document.createElement('label');
    descriptionLabel.textContent = 'Description:';
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.value = property.description || '';
    descriptionInput.dataset.path = path;
    descriptionInput.dataset.field = 'description';
    // The event listener will be attached in app.js
    parentElement.appendChild(descriptionLabel);
    parentElement.appendChild(descriptionInput);

    // Examples Input (only for non-object/array types)
    if (property.type !== 'object' && property.type !== 'array') {
        const examplesLabel = document.createElement('label');
        examplesLabel.textContent = 'Examples (comma-separated):';
        const examplesInput = document.createElement('input');
        examplesInput.type = 'text';
        examplesInput.value = (property.examples || []).join(', ');
        examplesInput.dataset.path = path;
        examplesInput.dataset.field = 'examples';
        // The event listener will be attached in app.js
        parentElement.appendChild(examplesLabel);
        parentElement.appendChild(examplesInput);
    }
}

/**
 * Recursively builds the annotation form for a given schema.
 * @param {string} key - The property key.
 * @param {object} property - The JSON schema property object.
 * @param {HTMLElement} parentElement - The element to append the form fields to.
 * @param {string} path - The dot-notation path to this property.
 */
function buildFormField(key, property, parentElement, path) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = key;
    fieldset.appendChild(legend);

    const isArrayOfObjects = property.type === 'array' && property.items && property.items.type === 'object';
    const isCollapsible = (property.type === 'object' && property.properties) || isArrayOfObjects;

    if (isCollapsible) {
        fieldset.classList.add('collapsible', 'collapsed');
        legend.addEventListener('click', (e) => {
            e.stopPropagation();
            fieldset.classList.toggle('collapsed');
        });
    }

    createPropertyInputs(fieldset, property, path);

    // Recurse for nested object properties.
    if (property.type === 'object' && property.properties) {
        const propsPath = `${path}.properties`;
        for (const subKey in property.properties) {
            buildFormField(subKey, property.properties[subKey], fieldset, `${propsPath}.${subKey}`);
        }
    }

    // Recurse for items in an array of objects.
    if (isArrayOfObjects) {
        const itemsSchema = property.items;
        const itemsPath = `${path}.items`;

        const itemsFieldset = document.createElement('fieldset');
        const itemsLegend = document.createElement('legend');
        itemsLegend.textContent = 'Array Item';
        itemsFieldset.appendChild(itemsLegend);

        createPropertyInputs(itemsFieldset, itemsSchema, itemsPath);

        if (itemsSchema.type === 'object' && itemsSchema.properties) {
            const itemsPropsPath = `${itemsPath}.properties`;
            for (const subKey in itemsSchema.properties) {
                buildFormField(subKey, itemsSchema.properties[subKey], itemsFieldset, `${itemsPropsPath}.${subKey}`);
            }
        }
        fieldset.appendChild(itemsFieldset);
    }

    parentElement.appendChild(fieldset);
}

/**
 * Creates the entire annotation form based on the provided schema.
 * @param {object} schema - The JSON schema.
 */
export function createEditForm(schema) {
    DOM.editFormContainer.innerHTML = '';
    const form = document.createElement('form');
    form.id = 'schema-edit-form';

    if (schema && schema.properties) {
        for (const key in schema.properties) {
            buildFormField(key, schema.properties[key], form, `properties.${key}`);
        }
    }
    DOM.editFormContainer.appendChild(form);
}

