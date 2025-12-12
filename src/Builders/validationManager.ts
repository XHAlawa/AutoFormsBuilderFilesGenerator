import { SchemaObject } from "../interfaces/schemaObject";

export class validationGenerator {
    static getValidators(schema: SchemaObject, isRequired: boolean): string[] {
        const validators: string[] = [];

        if (isRequired) {
            validators.push('Validators.required');
        }

        if (schema.format === 'email') {
            validators.push('Validators.email');
        }

        if (schema.format === 'guid') {
            validators.push(`guidValidator(${schema.nullable ? 'true' : ''})`);
        }

        if (schema.minLength != null) {
            validators.push(`Validators.minLength(${schema.minLength})`);
        }

        if (schema.maxLength != null) {
            validators.push(`Validators.maxLength(${schema.maxLength})`);
        }

        if (schema.minimum != null) {
            validators.push(`Validators.min(${schema.minimum})`);
        }

        if (schema.maximum != null) {
            validators.push(`Validators.max(${schema.maximum})`);
        }

        if (schema.pattern) {
            validators.push(`Validators.pattern('${schema.pattern}')`);
        }

        return validators;
    }
}
