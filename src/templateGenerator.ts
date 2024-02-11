import * as fs from 'fs';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';
import { IFormBuilderTemplate } from './templates/IFormBuilder'
import { CustomeValidators } from './templates/CustomeValidators.js';
import { SchemaObject } from './interfaces/schemaObject.js';

export default class templateGenerator {
    buildForm(body: { components: { schemas: any; }; }, parsedConfig: IParsedConfig) {

        let components = body.components.schemas;
        const builder = new templateBuilder(parsedConfig, components);

        Object.keys(components).forEach(key => {
            console.log("\n Working On : " + key); 
            builder.build(key, components[key] as SchemaObject);
        });
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "CustomeValidators.ts", CustomeValidators.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "IFormBuilder.ts", IFormBuilderTemplate.getTemplate());
    } 
}