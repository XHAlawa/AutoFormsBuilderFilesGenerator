import fileImportingManager from './fileImportingManager';
import arrayGenerator from './arrayProperty';
import injectServicesManager from './injectServicesManager';
import extraScriptManager from './extraScriptManager';
import { formBuilderTemplate } from './templates/formBuilder';
import { IParsedConfig } from './interfaces/IParsedConfig';
import { helpers } from './helpers';
import { IBuildServices, ICurrentProp } from './interfaces/ICurrentProp';

export class templateBuilder {
    arrayControls = ``;
    props = new extraScriptManager();
    toBeInjected = new Set('');
    importsManager: fileImportingManager = new fileImportingManager();

    constructor(private parsedConfig: IParsedConfig) { 
    }

    build(key: string, properties: object) { 
        this.importsManager.import('Injectable', '@angular/core');
        this.importsManager.import('DatePipe', '@angular/common');
        this.importsManager.import('FormArray, FormGroup, FormBuilder, AbstractControl', '@angular/forms');
        this.importsManager.import('IFormBuilder', './IFormBuilder');
        this.importsManager.import(key, this.parsedConfig.modelsPath);
 
        let services = <IBuildServices> {
            extraScriptManager: new extraScriptManager(),
            afterBuildScript: new extraScriptManager(),
            injectManager: new injectServicesManager(key),
            importsManager: this.importsManager,
            parsedConfigs: this.parsedConfig
        }

        Object.keys(properties).forEach(propertyName => {
             let property = <ICurrentProp> {
                DtoName: key,
                PropertyName: propertyName,
                Property: properties[propertyName],
                Services: services
            };

            if (property.Property.type == 'array')
                arrayGenerator.CreateArrayProp(property);

            this.props.append(`${helpers.tabs}${propertyName}: ${this.getJsDefaultType(property)},`)
        });

        services.afterBuildScript.append(arrayGenerator.toString());
        return formBuilderTemplate.getTemplate(
            key, 
            this.props.toString(),
            services
        );
    }

    getJsDefaultType(property: ICurrentProp) { // Specify the type of the property parameter
        let prop = property.Property;
        if (prop.type == 'array') return '[]';

        return prop.nullable ? 'null' : ({
            'number': '0',
            'string': `''`,
            'boolean': 'false',
            'integer': '0',
        })[prop.type] || undefined;
    }
}