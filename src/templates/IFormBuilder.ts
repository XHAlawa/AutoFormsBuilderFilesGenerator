export class IFormBuilderTemplate {
    static getTemplate() {
        return `
import { FormGroup } from '@angular/forms';

export interface IFormBuilder<T> {
  form: FormGroup;
  buildForm(model: T | null): FormGroup;
  resetForm(): void;
  value: T;
}`
    }
}
