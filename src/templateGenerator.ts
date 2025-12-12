import { enumTemplate } from './templates/enumHelper';
import { dateTemplate } from './templates/dateHelpers';
import * as fs from 'fs';
import * as path from 'path';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';
import { IFormBuilderTemplate } from './templates/IFormBuilder'
import { SchemaObject } from './interfaces/schemaObject.js';
import { formsHelpers } from './templates/formsHelpers.js';
import { showForErrorDirective } from './templates/ShowForErrorDirective';
import { validationManager } from './templates/validationManager';
import { customeValidators } from './templates/CustomeValidators';

export default class templateGenerator {
    buildForm(parsedConfig: IParsedConfig) {

        let components = parsedConfig.rootSchemas.components.schemas;
        const builder = new templateBuilder(parsedConfig, components);

        Object.keys(components).forEach(key => {
            console.log("\n Working On : " + key); 
            builder.build(key, components[key] as SchemaObject);
        });

        const cfg = parsedConfig;

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

        try {
            const expectedFiles = new Set<string>();

            // Model-based form files
            Object.keys(components).forEach(key => {
                expectedFiles.add(`${key}.ts`);
            });

            // Helper templates controlled by flags
            if (cfg.generateFormsHelpers ?? true) expectedFiles.add('FormsHelpers.ts');
            if (cfg.generateCustomValidators ?? true) expectedFiles.add('CustomeValidators.ts');
            if (cfg.generateValidationManager ?? true) expectedFiles.add('ValidationManager.ts');
            if (cfg.generateShowForErrorDirective ?? true) expectedFiles.add('ShowForErrorDirective.ts');
            if (cfg.generateIFormBuilder ?? true) expectedFiles.add('IFormBuilder.ts');
            if (cfg.generateDateHelper ?? true) expectedFiles.add('DateHelper.ts');
            if (cfg.generateEnumHelper ?? true) expectedFiles.add('EnumHelper.ts');

            const helperFiles = [
                'FormsHelpers.ts',
                'CustomeValidators.ts',
                'ValidationManager.ts',
                'ShowForErrorDirective.ts',
                'IFormBuilder.ts',
                'DateHelper.ts',
                'EnumHelper.ts'
            ];

            const outputDir = parsedConfig.formsOutput;
            const files = fs.readdirSync(outputDir)
                .filter(f => f.toLowerCase().endsWith('.ts'));

            let orphanRemovedCount = 0;

            files.forEach(file => {
                if (!expectedFiles.has(file)) {
                    const fullPath = path.join(outputDir, file);
                    fs.unlinkSync(fullPath);
                    orphanRemovedCount++;
                    console.log(`\tRemoved orphan form file: ${file}`);
                }
            });

            // Re-read files after cleanup for accurate counts
            const remainingFiles = fs.readdirSync(outputDir)
                .filter(f => f.toLowerCase().endsWith('.ts'));

            const helperCount = remainingFiles.filter(f => helperFiles.includes(f)).length;
            const modelFormCount = remainingFiles.length - helperCount;

            console.log('\nGeneration summary');
            console.log(`\tModels in schema: ${Object.keys(components).length}`);
            console.log(`\tForm builder files: ${modelFormCount}`);
            console.log(`\tHelper files: ${helperCount}`);
            console.log(`\tTotal .ts files in forms output: ${remainingFiles.length}`);
            console.log(`\tOrphan form files removed: ${orphanRemovedCount}`);
        } catch (err) {
            console.warn('Warning: failed to cleanup orphan form files', err);
        }
    } 
}