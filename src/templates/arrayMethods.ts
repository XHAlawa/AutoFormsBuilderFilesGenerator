import { helpers } from "../helpers";

export class arrayMethodsTemplate {
    public static getTemplate(propName: string, arrayRef: string) {
        let normalizedName = helpers.normalizeToFormBuilderName(arrayRef);
        return`
    get ${propName}Value(): ${arrayRef}[] {
      return this.${propName}Array().value as ${arrayRef}[];
    }
    ${propName}Array(): FormArray<FormGroup> {
        return this.form.controls['${propName}'] as FormArray<FormGroup>;
    }
    ${propName}Controls(): FormGroup[] {
        return this.${propName}Array().controls;  
    }
    delete${helpers.capitalizeFirstLetter(propName)}ByIndex(index: number): void {
        this.${propName}Array().removeAt(index);
    }
    ${propName}FormAt(index: number) {
      return (this.${propName}Array().controls[index] as any).__formGroupManager as ${normalizedName}
    }
    addNew${helpers.capitalizeFirstLetter(propName)}(model: ${arrayRef} | null = null): FormGroup<any> {
        let formInstance =  this.InjectorSrvc.get(${normalizedName});
        let frm = formInstance.buildForm(model);
        (frm as any).__formGroupManager = formInstance;
        this.${propName}Array().push(frm);
        return frm;
    }
    `   
    }


    public static getTemplateForPermitiveType(propName: string, arrayRef: string, validations: string) {
        return`
    get ${propName}Value(): ${arrayRef}[] {
      return this.${propName}Array().value as ${arrayRef}[];
    }
    ${propName}Array(): FormArray<FormControl> {
        return this.form.controls['${propName}'] as FormArray<FormControl>;
    }
    ${propName}Controls(): FormControl[] {
        return this.${propName}Array().controls;  
    }
    delete${helpers.capitalizeFirstLetter(propName)}ByIndex(index: number): void {
        this.${propName}Array().removeAt(index);
    }
    addNew${helpers.capitalizeFirstLetter(propName)}(value: ${arrayRef} | null = null): FormControl {
        const control = new FormControl(value, ${validations});
        this.${propName}Array().push(control);
        return control;
    }
    `   
    }

    private static getTabs(count: number) {
        let tabs = '';
        for (let i = 0; i < count; i++) {
            tabs += helpers.tabs;
        }
        return tabs;
    }

    public static getPatchTemplate(propName: string) {
        return `${this.getTabs(2)}if (model.${propName}) {\n` +
               `${this.getTabs(3)}this.${propName}Array().clear();\n` +
               `${this.getTabs(3)}model.${propName}.forEach(a => this.addNew${helpers.capitalizeFirstLetter(propName)}(a));\n` +
               `${this.getTabs(2)}}\n`;
    }
    
}