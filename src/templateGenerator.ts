import * as fs from 'fs';
import { templateBuilder } from './templateBuilder.js';
import { IParsedConfig } from './interfaces/IParsedConfig.js';

export default class templateGenerator {
 
    constructor(private paresedConfig: IParsedConfig) {
        this.paresedConfig = paresedConfig;
    }

    buildForm(body) {
        let components = body.components.schemas;
        Object.keys(components).forEach(key => {
            console.log("\n Working On : " + key);
            let builder = new templateBuilder(this.paresedConfig);
            let properties = components[key]['properties'];
            if (properties == null) return; // Skip

            let frm = builder.build(key, properties)
            fs.writeFileSync(this.paresedConfig.formsOutput + "/" + key + ".ts", frm);
        });
        fs.writeFileSync(this.paresedConfig.formsOutput + "/" + "IFormBuilder.ts", `
            import { FormGroup } from '@angular/forms';
            export interface IFormBuilder<T> {
                buildForm(model: T): FormGroup;
            }
        `)
    } 
}