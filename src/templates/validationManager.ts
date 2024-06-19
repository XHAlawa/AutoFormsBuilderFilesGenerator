export class validationManager {
  static getTemplate() {
    return `
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

// Define error types as constants
export const ErrorTypes = {
  Required: 'required',
  InvalidGuid: 'invalidGuid',
  MinLength: 'minlength',
  MaxLength: 'maxlength',
  Min: 'min',
  Max: 'max',
  Email: 'email',
  Pattern: 'pattern',
  OneOf: 'oneOf',
  NotMatchedField: 'notMatchedField',
  Date: 'date',
  InvalidCharacters: 'invalidCharacters',
  ExistingValue: 'existingValue',
  URL: 'url'
} as const;

// Define error messages for each error type
const ErrorMessages: Record<keyof typeof ErrorTypes, string> = {
  Required: 'This field is required',
  InvalidGuid: 'Invalid GUID format',
  MinLength: 'Minimum length is {requiredLength} characters',
  MaxLength: 'Maximum length is {requiredLength} characters',
  Min: 'Minimum value is {min}',
  Max: 'Maximum value is {max}',
  Email: 'Invalid email format',
  Pattern: 'Invalid format',
  OneOf: 'Invalid value',
  NotMatchedField: 'Fields do not match',
  Date: 'Invalid date format',
  InvalidCharacters: 'Invalid characters in input',
  ExistingValue: 'Value already exists',
  URL: 'Invalid URL format'
};

@Injectable({
  providedIn: 'root'
})
export class ValidationManager {
  static getErrorMessage(control: FormControl): string {
    if (control.errors) {
      for (const errorType of Object.keys(ErrorTypes) as Array<keyof typeof ErrorTypes>) {
        if (control.errors[ErrorTypes[errorType]]) {
          return ValidationManager.formatErrorMessage(errorType, control.errors[ErrorTypes[errorType]]);
        }
      }
    }
    return 'Invalid field';
  }

  private static formatErrorMessage(errorType: keyof typeof ErrorTypes, errorValue?: any): string {
    const errorMessageTemplate = ErrorMessages[errorType];
    if (!errorMessageTemplate) {
      return 'Unknown error';
    }

    if (errorValue !== null && typeof errorValue === 'object') {
      return errorMessageTemplate.replace(/{([^}]+)}/g, (_, match) => errorValue[match]);
    }

    return errorMessageTemplate;
  }

  static addErrorType(type: string, message: string): void {
    (ErrorTypes as any)[type] = type;
    ErrorMessages[type as keyof typeof ErrorTypes] = message;
  }
}
    `;
  }
}