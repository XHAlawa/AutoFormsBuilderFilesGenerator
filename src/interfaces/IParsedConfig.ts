import { SchemaObject } from "./schemaObject";

export interface IParsedConfig {
    rootSchemas: { components: { schemas: any; }; }; 
    input: string;
    modelsPath: string;
    formsOutput: string;
    schemeFile: string;
    useEnumValuesAsString?: boolean;
    useSignalFormTemplates?: boolean;
    generateFormsHelpers?: boolean;
    generateCustomValidators?: boolean;
    generateValidationManager?: boolean;
    generateShowForErrorDirective?: boolean;
    generateIFormBuilder?: boolean;
    generateDateHelper?: boolean;
    generateEnumHelper?: boolean;
    customFormTemplatePath?: string;
    customSignalFormTemplatePath?: string;
    validationErrorTemplatePath?: string;
    generateValidationUiHelpers?: boolean;
    cleanupUnusedFiles?: boolean;
    includeModels?: string[];
    excludeModels?: string[];
    generateValidationMessagesJson?: boolean;
}