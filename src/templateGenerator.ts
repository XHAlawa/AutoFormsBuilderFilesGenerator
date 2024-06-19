import { enumTemplate } from './templates/enumHelper';
import { dateTemplate } from './templates/dateHelpers';
import * as fs from 'fs';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';
import { IFormBuilderTemplate } from './templates/IFormBuilder'
import { SchemaObject } from './interfaces/schemaObject.js';
import { formsHelpers } from './templates/formsHelpers.js';
import { showForErrorDirective } from './templates/ShowForErrorDirective';
import { validationManager } from './templates/validationManager';
import { customeValidators } from './templates/customeValidators';

export default class templateGenerator {
    buildForm(body: { components: { schemas: any; }; }, parsedConfig: IParsedConfig) {

        let components = body.components.schemas;
        const builder = new templateBuilder(parsedConfig, components);

        Object.keys(components).forEach(key => {
            console.log("\n Working On : " + key); 
            builder.build(key, components[key] as SchemaObject);
        });
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "FormsHelpers.ts", formsHelpers.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "CustomeValidators.ts", customeValidators.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "ValidationManager.ts", validationManager.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "ShowForErrorDirective.ts", showForErrorDirective.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "IFormBuilder.ts", IFormBuilderTemplate.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "DateHelper.ts", dateTemplate.getTemplate());
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "EnumHelper.ts", enumTemplate.getTemplate());
    } 
}