export class IFormBuilderTemplate {
    static getTemplate() {
        return `
        import { FormGroup } from '@angular/forms';
            export interface IFormBuilder<T> {
            buildForm(model: T): FormGroup;
        }`
    }
}