import { BasedOnEnumType } from './Builders/BasedOnEnumType';
import { PermitiveType } from './Builders/PermitiveType';
import fileImportingManager from './scriptManager/fileImportingManager';
import injectServicesManager from './scriptManager/injectServicesManager';
import scriptManager from './scriptManager/scriptManager';
import { formBuilderTemplate } from './templates/formBuilderService';
import { IParsedConfig } from './interfaces/IParsedConfig';
import { IBuildServices, IDataType } from './interfaces/ICurrentProp';
import * as fs from 'fs';
import { SchemaObject, ReferenceObject } from './interfaces/schemaObject';
import { helpers } from './helpers';
import { ArrayType } from './Builders/Array';
import { PropertAccessory } from './Builders/PropertyAccessors';
export class templateBuilder {
    constructor(private parsedConfig: IParsedConfig,private components: any) { 
    }

    build(key: string, component: SchemaObject) { 
        let buildServices = <IBuildServices> this.GetRequiredBuildServices(key)
        this.ImportRequiredServicesForFormBuilder(key, buildServices);

        if (component.allOf != null) 
            this.ResolveAllOfProperties(component);
 
        if (component.properties) 
        {
            const permitiveType = new PermitiveType();
            const basedOnEnumType = new BasedOnEnumType();
            const arrayType = new ArrayType();
            const propAccessor = new PropertAccessory();

            Object.keys(component.properties!).forEach(propName => {
                const prop = component.properties![propName] as SchemaObject;

                if (prop.type == IDataType.array)
                    arrayType.build(propName, prop, component, buildServices);
                else if (prop.type == undefined && (prop as any as ReferenceObject).$ref != null) 
                    basedOnEnumType.build(propName, prop, component, buildServices);
                else if (prop.enum == null)
                    permitiveType.build(propName, prop, component, buildServices);

                propAccessor.build(propName, prop, component, buildServices);
            });
            let result = formBuilderTemplate.getTemplate( key,  buildServices);
            fs.writeFileSync(this.parsedConfig.formsOutput + "/" + key + ".ts", result);
            console.info(`\tProcessing ${key}: Completed`);

        } else if (component.enum) {
            console.warn(`\t${key} Contains Enum.. and it's not suppprted for now`)
        }


    }
    
    ResolveAllOfProperties(component: SchemaObject) {
        var ref = (component.allOf! as ReferenceObject[])[0];
        let targetModelKey = ref.$ref.replace(helpers.componentsPath, '')
        var targetModel = this.components[targetModelKey] as SchemaObject;
        
        component.properties = { ...(component.allOf![1] as SchemaObject).properties, ...targetModel.properties };
        delete component.allOf;
    }


    private ImportRequiredServicesForFormBuilder(key: string,services: IBuildServices) {
        services.importsManager.import('Injectable', '@angular/core');
        services.importsManager.import('DatePipe', '@angular/common');
        services.importsManager.import('FormControl, FormArray, FormGroup, FormBuilder, AbstractControl, Validators', '@angular/forms');
        services.importsManager.import('IFormBuilder', './IFormBuilder');
        services.importsManager.import('oneOfValidator, guidValidator', './CustomeValidators');
        services.importsManager.import(key, this.parsedConfig.modelsPath);
    }

    private GetRequiredBuildServices(key: string): IBuildServices {
        return {
            serviceScripts: new scriptManager(),
            afterBuildScript: new scriptManager(),
            formGroupProps: new scriptManager(),
            injectManager: new injectServicesManager(key),
            importsManager: new fileImportingManager(),
            parsedConfigs: this.parsedConfig,
            components: this.components
        };
    }
}