import { BasedOnEnumType } from './Builders/BasedOnEnumType';
import { PermitiveType } from './Builders/PermitiveType';
import fileImportingManager from './scriptManager/fileImportingManager';
import injectServicesManager from './scriptManager/injectServicesManager';
import scriptManager from './scriptManager/scriptManager';
import { formBuilderTemplate } from './templates/formBuilderService';
import { signalFormBuilderTemplate } from './templates/signalFormBuilderService';
import { IParsedConfig } from './interfaces/IParsedConfig';
import { IBuildServices, IDataType } from './interfaces/ICurrentProp';

import * as fs from 'fs';
import * as path from 'path';

import { SchemaObject, ReferenceObject } from './interfaces/schemaObject';
import { helpers } from './helpers';
import { ArrayType } from './Builders/Array'; 
import { propFunctionsTemplate } from './templates/propsFunctions';
import { childFormBuilderReference } from './Builders/childFormBuilderReference';
import { referenceGraph } from './helpers/referenceGraph';

export class templateBuilder {
    private referenceGraph: referenceGraph;

    constructor(private parsedConfig: IParsedConfig,private components: any, modelKeys: string[] = Object.keys(components)) { 
        this.referenceGraph = new referenceGraph(components, parsedConfig, modelKeys);
    }

    build(key: string, component: SchemaObject) { 
        if (this.referenceGraph.isExcluded(key)) {
            console.warn(`\t${key} Is Excluded By excludeModels.. Skipped`);
            return;
        }

        let buildServices = <IBuildServices> this.GetRequiredBuildServices(key)
        const useSignalFormTemplates = this.parsedConfig.useSignalFormTemplates ?? false;
        this.ImportRequiredServicesForFormBuilder(key, buildServices, useSignalFormTemplates);
        this.InjectServices(key, buildServices);
        buildServices.serviceProviders.append(formBuilderTemplate.getProvidersTemplate(key, key));

        if (component.allOf != null) 
            this.flattenAllOfToProperties(component);
 
        if (component.properties) 
        {
            const permitiveType = new PermitiveType();
            const basedOnEnumType = new BasedOnEnumType();
            const arrayType = new ArrayType(); 

            Object.keys(component.properties!).forEach(propName => {
                const prop = component.properties![propName] as SchemaObject;
                // Property types that are only known through an excluded model are skipped as well
                if (!this.isPropertyGeneratable(key, prop)) return;

                if (prop.type == IDataType.array)
                    arrayType.build(propName, prop, component, buildServices);
                else if (prop.type == undefined && (prop as any as ReferenceObject).$ref != null) 
                    basedOnEnumType.build(propName, prop, component, buildServices);
                else if (prop.enum == null)
                    permitiveType.build(propName, prop, component, buildServices);
                else 
                    return;

                buildServices.serviceScripts.append(propFunctionsTemplate.getTemplate(propName));
            });

            buildServices.importsManager.import(helpers.capitalizeFirstLetter(key), this.parsedConfig.modelsPath);

            let result: string;
            if (useSignalFormTemplates) {
                const customPath = this.parsedConfig.customSignalFormTemplatePath;
                if (customPath) {
                    const customTemplate = this.getCustomTemplate(customPath);
                    result = customTemplate(key, buildServices);
                } else {
                    result = signalFormBuilderTemplate.getTemplate(key, buildServices);
                }
            } else {
                const customPath = this.parsedConfig.customFormTemplatePath;
                if (customPath) {
                    const customTemplate = this.getCustomTemplate(customPath);
                    result = customTemplate(key, buildServices);
                } else {
                    result = formBuilderTemplate.getTemplate(key, buildServices);
                }
            }
            fs.writeFileSync(this.parsedConfig.formsOutput + "/" + key + ".ts", result);
            console.info(`\tProcessing ${key}: Completed`);

        } else if (component.enum) {
            console.warn(`\t${key} Contains Enum.. and it's not suppprted for now`)
        }
    }

    private isPropertyGeneratable(modelName: string, prop: SchemaObject) {
        if (prop.type == IDataType.array) {
            const items = (prop.items ?? {}) as SchemaObject;
            if ((items as any as ReferenceObject).$ref == null) return true;
            return childFormBuilderReference.getTargetModelName(items, this.getBuildServicesForLookup(modelName)) != null;
        }

        if (prop.type == undefined && (prop as any as ReferenceObject).$ref != null)
            return childFormBuilderReference.getTargetModelName(prop, this.getBuildServicesForLookup(modelName)) != null;

        return true;
    }

    private getBuildServicesForLookup(modelName: string): IBuildServices {
        return {
            injectManager: new injectServicesManager(modelName),
            formGroupProps: new scriptManager(),
            serviceScripts: new scriptManager(),
            serviceProviders: new scriptManager(),
            patchModelScripts: new scriptManager(),
            afterBuildScript: new scriptManager(),
            importsManager: new fileImportingManager(),
            parsedConfigs: this.parsedConfig,
            components: this.components,
            referenceGraph: this.referenceGraph,
            currentModelName: modelName
        };
    }

    InjectServices(key: string, buildServices: IBuildServices) {
        buildServices.injectManager.inject("Injector")
    }

    flattenAllOfToProperties(component: SchemaObject) {
        let props: any = {};
        let required: string[] = [];

        (component.allOf! as SchemaObject[]).forEach((refOrSchema: SchemaObject) => {
            if ((refOrSchema as ReferenceObject).$ref) {
                const targetKey = (refOrSchema as ReferenceObject).$ref.replace(helpers.componentsPath, '');
                const target = this.components[targetKey] as SchemaObject;
                props = { ...props, ...target.properties };
                if (target.required) {
                    required.push(...target.required);
                }
            } else {
                props = { ...props, ...refOrSchema.properties };
                if (refOrSchema.required) {
                    required.push(...refOrSchema.required);
                }
            }
        });

        component.properties = props;
        component.required = Array.from(new Set([...(component.required ?? []), ...required]));
        delete component.allOf;
    }

    private ImportRequiredServicesForFormBuilder(key: string, services: IBuildServices, useSignalFormTemplates: boolean) {
        services.importsManager.import('Injectable', '@angular/core');
        services.importsManager.import('isDevMode', '@angular/core');
        services.importsManager.import('Injector', '@angular/core');

        if (useSignalFormTemplates) {
            services.importsManager.import('signal, computed', '@angular/core');
        }

        services.importsManager.import('DatePipe', '@angular/common');
        services.importsManager.import('FormControl, FormArray, FormGroup, FormBuilder, AbstractControl, Validators', '@angular/forms');
        services.importsManager.import('IFormBuilder', './IFormBuilder');
        services.importsManager.import('oneOfValidator, guidValidator', './CustomeValidators');
        services.importsManager.import(helpers.capitalizeFirstLetter(key), this.parsedConfig.modelsPath);
    }

    private GetRequiredBuildServices(key: string): IBuildServices {
        return {
            serviceScripts: new scriptManager(),
            afterBuildScript: new scriptManager(),
            formGroupProps: new scriptManager(),
            serviceProviders: new scriptManager(),
            injectManager: new injectServicesManager(key),
            importsManager: new fileImportingManager(),
            patchModelScripts: new scriptManager(),
            parsedConfigs: this.parsedConfig,
            components: this.components,
            referenceGraph: this.referenceGraph,
            currentModelName: key
        };
    }

    private getCustomTemplate(modulePath: string): (key: string, services: IBuildServices) => string {
        const resolvedPath = path.isAbsolute(modulePath)
            ? modulePath
            : path.resolve(process.cwd(), modulePath);

        const loaded: any = require(resolvedPath);

        if (loaded && typeof loaded.getTemplate === 'function')
            return loaded.getTemplate.bind(loaded);

        if (loaded && loaded.formBuilderTemplate && typeof loaded.formBuilderTemplate.getTemplate === 'function')
            return loaded.formBuilderTemplate.getTemplate.bind(loaded.formBuilderTemplate);

        if (loaded && loaded.default && typeof loaded.default.getTemplate === 'function')
            return loaded.default.getTemplate.bind(loaded.default);

        throw new Error(`Custom form template module '${modulePath}' does not expose a compatible getTemplate(key, services) function.`);
    }
}
