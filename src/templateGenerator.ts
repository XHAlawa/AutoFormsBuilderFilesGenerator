import * as fs from 'fs';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';

export default class templateGenerator {
 
    buildForm(body: { components: { schemas: any; }; }, parsedConfig: IParsedConfig) {
        let components = body.components.schemas;
        Object.keys(components).forEach(key => {
            console.log("\n Working On : " + key);
            let builder = new templateBuilder(parsedConfig);
            let properties = components[key]['properties'];
            if (properties == null) {
                if (components[key].allOf && components[key].allOf.length == 2) {
                    properties = components[key].allOf[1].properties;
                    let inhertPath = components[key].allOf[0].$ref.replace('#/components/schemas/', '');
                    properties = { ...properties, ...components[inhertPath].properties }
                    //check for inherited props

                } else {
                    console.log(" .... File Skipped");
                    return; // Skip it
                }
            }

            let frm = builder.build(key, properties)
            fs.writeFileSync(parsedConfig.formsOutput + "/" + key + ".ts", frm);
        });
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "IFormBuilder.ts", `
            import { FormGroup } from '@angular/forms';
            export interface IFormBuilder<T> {
                buildForm(model: T): FormGroup;
            }
        `)
    } 
}