import { helpers } from "../helpers";
import { SchemaObject } from "../interfaces/schemaObject";

export class arrayMethodsTemplate {
    public static getTemplate(propName: string, arrayRef: string) {
        let normalizedName = helpers.normalizeToFormBuilderName(arrayRef);
        return`
    get ${propName}Value(): ${arrayRef}[] {
      return this.${propName}Array().value as ${arrayRef}[];
    }
    ${propName}Array(): FormArray {
        return this.form.controls['${propName}'] as FormArray;
    }
    ${propName}Controls(): AbstractControl<any, any>[] {
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

    public static getPatchTemplate(propName: string) {
        return `${helpers.tabs}${helpers.tabs}model.${propName}?.forEach(a => this.addNew${helpers.capitalizeFirstLetter(propName)}(a));\n`
    }
    
}