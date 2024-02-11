export class CustomeValidators {
    static getTemplate() {
        return `
        import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

        export function oneOfValidator(validOptions: any[]): ValidatorFn {
          return (control: AbstractControl): ValidationErrors | null => {
            if (validOptions.indexOf(control.value) === -1) {
              return { oneOf: true };
            }
            return null;
          };
        }   

        export function guidValidator(allowNull: boolean = false): ValidatorFn {
          return (control: AbstractControl): { [key: string]: any } | null => {
            if (allowNull && control.value == null || control.value.toString().length == 0)  {
              return null;
            }
            const valid = Validators.pattern(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)(control);
            return valid ? null : { 'invalidGuid': { value: control.value } };
          };
        }
        `;
    }
}