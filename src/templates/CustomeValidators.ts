export class customeValidators {
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
          if (allowNull && control.value == null || control.value?.toString().length == 0)  {
            return null;
          }
          const valid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(control.value);
          return valid ? null : { 'invalidGuid': { value: control.value } };
        };
      }

      export function CompareFields(source: string, targetField: string): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
          let field1 = group.get(source[0]);
          let confirmation = group.get(targetField[1]);

          if (field1?.value == null || confirmation?.value == null) return null;

          if (!field1.dirty || !confirmation.dirty) return null;

          return field1?.value == confirmation?.value ? null : { notMatchedField: true };
        }
      }        
      `;
  }
}