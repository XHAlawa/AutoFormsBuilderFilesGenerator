import { helpers } from "../helpers";
import { ICurrentProp } from "../interfaces/ICurrentProp";

export class arrayMethodsTemplate {
    public static getTemplate(property: ICurrentProp, caller: string, arrayRef: string) {
        return`
    ${property.PropertyName}Array(): FormArray {
        return this.form.controls['${property.PropertyName}'] as FormArray;
    }
    ${property.PropertyName}Controls(): AbstractControl<any, any>[] {
        return this.${property.PropertyName}Array().controls;  
    }
    delete${property.PropertyName}ByIndex(index: number): void {
        this.${property.PropertyName}Array().removeAt(index);
    }
    addNew${property.PropertyName}(model: ${arrayRef} | null = null): FormGroup<any> {
        let frm = ${caller}.buildForm(model);
        this.${property.PropertyName}Array().push(frm);
        return frm;
    }
    `   
    }
}