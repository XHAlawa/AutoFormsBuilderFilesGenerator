export class formsExtensionsTemplate {
  static getTemplate() {
    return `
import '@angular/forms';

declare module '@angular/forms' {
  interface FormGroup {
    showValidationErrors?(options?: { generateHtml?: boolean }): void;
  }
}
`;
  }
}
