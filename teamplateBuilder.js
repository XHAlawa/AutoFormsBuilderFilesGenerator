import fileImportingManager from './fileImportingManager.js';
import { helpers } from './helpers.js';


export class templateBuilder {
    arrayControls = ``;
    toBeConvertedAsArray = ``;
    paresedConfig = ``;
    props = ``;
    toBeInjected = ``;
    importsManager = null;

    constructor(paresedConfig) {
        this.helpers = new helpers();
        this.paresedConfig = paresedConfig;
        this.importsManager = new fileImportingManager();
    }

    build(key, properties) {
        this.importsManager.import('Injectable', '@angular/core');
        this.importsManager.import('DatePipe', '@angular/common');
        this.importsManager.import('FormArray, FormGroup, FormBuilder', '@angular/forms');
        this.importsManager.import('IFormBuilder', './IFormBuilder');
        this.importsManager.import(key, this.paresedConfig.modelsPath);

        Object.keys(properties).forEach(propertyName => {
            let property = properties[propertyName];
            if (property.type == 'array') {
                this.props += `${propertyName}: [] `;
                this.convertToArray(propertyName);
                if (property.items != null && property.items.$ref)
                    this.createRefArray(propertyName, property);
            } else if (property.$ref) {
                this.props += `${propertyName}: undefined`;
            } else {
                let defaultType = property.nullable ? 'null' : ({
                    'number': '0',
                    'string': `''`,
                    'boolean': 'false',
                    'integer': '0',
                })[property.type] || '';
                this.props += `${propertyName}: ${defaultType}`;
            }
            this.props += `,\n${this.helpers.tabs}`;
        });

        return `
${this.importsManager.toString()}
@Injectable({ providedIn: 'root' })
export class ${key}FormBuilder implements IFormBuilder<${key}> {
    DatePipe: DatePipe = null as any;
    DateFormat: string = 'yyyy-MM-dd';
    form: FormGroup = null as any;

    constructor(private fb: FormBuilder
${this.toBeInjected}
    ) {
        this.DatePipe = new DatePipe('en-US');
    }

    updateCulture(culture: string = 'en-US') {
        this.DatePipe = new DatePipe(culture);
    }

    buildForm(model: ${key}) {
        this.form = this.fb.group<${key}>({
            ${this.props}
        });
        if (model != null) {
            this.form.patchValue({ ... model });
        }
        ${this.toBeConvertedAsArray}

        return this.form;
    }
    ${this.arrayControls}
}
                `
    }

    convertToArray(propName) {
        this.toBeConvertedAsArray += `this.form.setControl('${propName}', this.fb.array([]));`
    }

    buildArrayControls(propertyName, ref) {
        propertyName = this.helpers.capitalizeFirstLetter(propertyName);

        this.arrayControls += `\n
    ${propertyName}Array() {
        return (this.form.controls['${propertyName}'] as FormArray);
    }
    ${propertyName}Controls() {
        return this.${propertyName}Array().controls;  
    }
    delete${propertyName}ByIndex(index: number) {
        this.${propertyName}Array().removeAt(index);
    }
    addNew${propertyName}(model: ${ref} | null = null) {
        let frm = this.${propertyName.toLowerCase()}Srvc.buildForm(model);
        this.${propertyName}Array().push(frm);
    }
    `;
    }

    createRefArray(propertyName, property, importsManager) {
        let ref = this.replacePath(property.items.$ref);
        this.toBeInjected += `${this.helpers.tabs},private ${propertyName.toLowerCase()}Srvc: ${this.helpers.capitalizeFirstLetter(propertyName)}FormBuilder \n${this.helpers.tabs}`
        this.importsManager.import(`${this.helpers.capitalizeFirstLetter(propertyName)}FormBuilder`, this.paresedConfig.target);
        this.importsManager.import(`${ref}`, this.paresedConfig.modelsPath);
        this.buildArrayControls(propertyName, ref);
    }

    replacePath(path) {
        let paths = path.split('/');
        return this.helpers.capitalizeFirstLetter(paths[paths.length - 1]);
    }
}