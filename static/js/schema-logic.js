/**
 * Infers a JSON Schema from a JavaScript value.
 * @param {*} value The value to generate a schema for.
 * @returns {object} The generated JSON Schema.
 */
export function generateSchema(value) {
    if (value === null) {
        return { type: 'null' };
    }

    const type = Array.isArray(value) ? 'array' : typeof value;

    switch (type) {
        case 'string':
            return { type: 'string' };
        case 'number':
            return { type: Number.isInteger(value) ? 'integer' : 'number' };
        case 'boolean':
            return { type: 'boolean' };
        case 'array': {
            if (value.length === 0) {
                return { type: 'array', items: {} };
            }
            const itemSchemas = value.map(generateSchema);
            const firstSchema = itemSchemas[0];
            const isHomogeneous = itemSchemas.slice(1).every(s => JSON.stringify(s) === JSON.stringify(firstSchema));

            if (isHomogeneous) {
                return { type: 'array', items: firstSchema };
            }
            const uniqueSchemaStrings = new Set(itemSchemas.map(s => JSON.stringify(s)));
            const uniqueSchemas = Array.from(uniqueSchemaStrings).map(s => JSON.parse(s));
            return { type: 'array', items: { anyOf: uniqueSchemas } };
        }
        case 'object': {
            const properties = {};
            for (const key of Object.keys(value)) {
                properties[key] = generateSchema(value[key]);
            }
            return {
                type: 'object',
                properties,
                required: Object.keys(value)
            };
        }
        default:
            return {};
    }
}

