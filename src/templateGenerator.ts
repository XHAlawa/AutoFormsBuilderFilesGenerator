import { enumTemplate } from './templates/enumHelper';
import { dateTemplate } from './templates/dateHelpers';
import * as fs from 'fs';
import * as path from 'path';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';
import { IFormBuilderTemplate } from './templates/IFormBuilder'
import { SchemaObject } from './interfaces/schemaObject.js';
import { formsHelpers } from './templates/formsHelpers.js';
import { showForErrorDirective } from './templates/showForErrorDirective';
import { validationManager } from './templates/validationManager';
import { customeValidators } from './templates/customeValidators';
import { validationUiHelpersTemplate } from './templates/validationUiHelpers';
import { autoFormsBuilderModuleTemplate } from './templates/autoFormsBuilderModule';
import { formsExtensionsTemplate } from './templates/formsExtensions';

export default class templateGenerator {
    buildForm(parsedConfig: IParsedConfig) {

        const cfg = parsedConfig;
        let components = parsedConfig.rootSchemas.components.schemas;
        const builder = new templateBuilder(parsedConfig, components);

        const allKeys = Object.keys(components);
        let modelKeys = allKeys;

        if (Array.isArray(cfg.includeModels) && cfg.includeModels.length > 0) {
            modelKeys = modelKeys.filter(k => cfg.includeModels!.includes(k));
        }

        if (Array.isArray(cfg.excludeModels) && cfg.excludeModels.length > 0) {
            modelKeys = modelKeys.filter(k => !cfg.excludeModels!.includes(k));
        }

        modelKeys.forEach(key => {
            console.log("\n Working On : " + key); 
            builder.build(key, components[key] as SchemaObject);
        });

        if (cfg.generateFormsHelpers ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "FormsHelpers.ts", formsHelpers.getTemplate());

        if (cfg.generateCustomValidators ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "CustomeValidators.ts", customeValidators.getTemplate());

        if (cfg.generateValidationManager ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "ValidationManager.ts", validationManager.getTemplate());

        if (cfg.generateShowForErrorDirective ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "ShowForErrorDirective.ts", showForErrorDirective.getTemplate());

        if (cfg.generateIFormBuilder ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "IFormBuilder.ts", IFormBuilderTemplate.getTemplate());

        if (cfg.generateDateHelper ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "DateHelper.ts", dateTemplate.getTemplate());

        if (cfg.generateEnumHelper ?? true)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "EnumHelper.ts", enumTemplate.getTemplate());

        if (cfg.generateValidationUiHelpers ?? true) {
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "ValidationUiHelpers.ts", validationUiHelpersTemplate.getTemplate());
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "AutoFormsBuilderModule.ts", autoFormsBuilderModuleTemplate.getTemplate());
            fs.writeFileSync(parsedConfig.formsOutput + "/" + "FormsExtensions.d.ts", formsExtensionsTemplate.getTemplate());
        }

        if (cfg.generateValidationMessagesJson ?? true) {
            const messagesJson = {
                Required: 'This field is required',
                InvalidGuid: 'Invalid GUID format',
                MinLength: 'Minimum length is {requiredLength} characters',
                MaxLength: 'Maximum length is {requiredLength} characters',
                Min: 'Minimum value is {min}',
                Max: 'Maximum value is {max}',
                Email: 'Invalid email format',
                Pattern: 'Invalid format',
                OneOf: 'Invalid value',
                NotMatchedField: 'Fields do not match',
                Date: 'Invalid date format',
                InvalidCharacters: 'Invalid characters in input',
                ExistingValue: 'Value already exists',
                URL: 'Invalid URL format'
            } as any;
            fs.writeFileSync(
                parsedConfig.formsOutput + "/" + "validation-messages.en.json",
                JSON.stringify(messagesJson, null, 2)
            );
        }

        try {
            const expectedFiles = new Set<string>();

            modelKeys.forEach(key => {
                expectedFiles.add(`${key}.ts`);
            });

            if (cfg.generateFormsHelpers ?? true) expectedFiles.add('FormsHelpers.ts');

            if (cfg.generateCustomValidators ?? true) expectedFiles.add('CustomeValidators.ts');
            if (cfg.generateValidationManager ?? true) expectedFiles.add('ValidationManager.ts');
            if (cfg.generateShowForErrorDirective ?? true) expectedFiles.add('ShowForErrorDirective.ts');
            if (cfg.generateIFormBuilder ?? true) expectedFiles.add('IFormBuilder.ts');
            if (cfg.generateDateHelper ?? true) expectedFiles.add('DateHelper.ts');
            if (cfg.generateEnumHelper ?? true) expectedFiles.add('EnumHelper.ts');
            if (cfg.generateValidationUiHelpers ?? true) {
                expectedFiles.add('ValidationUiHelpers.ts');
                expectedFiles.add('AutoFormsBuilderModule.ts');
            }

            const helperFiles = [
                'FormsHelpers.ts',
                'CustomeValidators.ts',
                'ValidationManager.ts',
                'ShowForErrorDirective.ts',
                'IFormBuilder.ts',
                'DateHelper.ts',
                'EnumHelper.ts',
                'ValidationUiHelpers.ts',
                'AutoFormsBuilderModule.ts'
            ];

            const outputDir = parsedConfig.formsOutput;
            const files = fs.readdirSync(outputDir)
                .filter(f => f.toLowerCase().endsWith('.ts'));

            let orphanRemovedCount = 0;

            if (cfg.cleanupUnusedFiles ?? true) {
                files.forEach(file => {
                    if (!expectedFiles.has(file)) {
                        const fullPath = path.join(outputDir, file);
                        fs.unlinkSync(fullPath);
                        orphanRemovedCount++;
                        console.log(`\tRemoved unused file: ${file}`);
                    }
                });
            }

            // Re-read files after cleanup for accurate counts
            const remainingFiles = fs.readdirSync(outputDir)
                .filter(f => f.toLowerCase().endsWith('.ts'));

            const helperCount = remainingFiles.filter(f => helperFiles.includes(f)).length;
            const modelFormCount = remainingFiles.length - helperCount;

            console.log('\nGeneration summary');
            console.log(`\tModels in schema: ${modelKeys.length}`);

            console.log(`\tForm builder files: ${modelFormCount}`);
            console.log(`\tHelper files: ${helperCount}`);
            console.log(`\tTotal .ts files in forms output: ${remainingFiles.length}`);
            console.log(`\tOrphan form files removed: ${orphanRemovedCount}`);
        } catch (err) {
            console.warn('Warning: failed to cleanup orphan form files', err);
        }
    } 
}