import { helpers } from "../helpers";
import { SchemaObject } from "../interfaces/schemaObject";

export class arrayMethodsTemplate {
    public static getTemplate(propName: string, arrayRef: string) {
        return`
    ${propName}Array(): FormArray {
        return this.form.controls['${propName}'] as FormArray;
    }
    ${propName}Controls(): AbstractControl<any, any>[] {
        return this.${propName}Array().controls;  
    }
    delete${helpers.capitalizeFirstLetter(propName)}ByIndex(index: number): void {
        this.${propName}Array().removeAt(index);
    }
    addNew${helpers.capitalizeFirstLetter(propName)}(model: ${arrayRef} | null = null): FormGroup<any> {
        let frm = this.${arrayRef}Srvc.buildForm(model);
        this.${propName}Array().push(frm);
        return frm;
    }
    `   
    }
    
}