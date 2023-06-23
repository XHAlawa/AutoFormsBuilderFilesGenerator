import fileImportingManager from './fileImportingManager.js';
import * as fs from 'fs';
import { templateBuilder } from './teamplateBuilder.js';
import { helpers } from './helpers.js';
import path from 'path';
export default class templateGenerator {

    helpers = null;
    paresedConfig = null;
    constructor(paresedConfig) {
        this.helpers = new helpers();
        this.paresedConfig = paresedConfig;
    }
    buildForm(body) {
        let components = body.components.schemas;
        Object.keys(components).forEach(key => {
            process.stdout.write("\n Working On : " + key);
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