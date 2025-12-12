export class helpers {
    static tabs = `\t\t\t`;
    static tabs2 = `\t\t`;
    static tabs1 = `\t`;
    static componentsPath: string = '#/components/schemas/';
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } 

    static normalizeToFormBuilderName(name: string) {
        return helpers.capitalizeFirstLetter(name) + 'FormBuilder';
    }

    static isNullOrEmpty(text: string) {
        return text == null || text.toString().trim() == '';
    }

    static getDefaultType(type: string, nullable?: boolean) { // Specify the type of the property parameter
        if (type == 'array') return '[]';
    
        return nullable ? 'null' : ({
            'number': '0',
            'string': `''`,
            'boolean': 'false',
            'integer': '0'
        })[type] || undefined;
    }
    static getInitialValue(schema: { default?: any, nullable?: boolean, type?: string }) {
        if (schema.hasOwnProperty('default') && schema.default !== undefined && schema.default !== null) {
            return typeof schema.default === 'string' ? `'${schema.default}'` : schema.default;
        }
        return helpers.getDefaultType(schema.type ?? 'string', schema.nullable);
    }
}