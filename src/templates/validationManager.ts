export class validationManager {
  static getTemplate() {
    return `
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Observable, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// Error type keys used across the app
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

export type ErrorKey = keyof typeof ErrorTypes;      // 'Required' | 'MinLength' | ...
export type ErrorCode = (typeof ErrorTypes)[ErrorKey]; // 'required' | 'minlength' | ...

export interface ValidationMessageVM {
  key: ErrorKey;
  code: ErrorCode;
  message: string;
  value?: any;
}

export interface GlobalTemplatePlaceholders {
  message?: string;    // e.g. 'ErrorPlaceHolder'
  controlKey?: string; // e.g. 'ctrlKey'
}

export interface ValidationCssConfig {
  invalidClass?: string;        // CSS class applied to invalid controls
  errorContainerClass?: string; // CSS class applied to auto-generated error containers
}

export type ValidationMessageResolver = (params: {
  key: ErrorKey;
  code: ErrorCode;
  error: any;
  defaultTemplate: string;
  control: AbstractControl;
}) => string;

// Default English messages with placeholders
const DefaultErrors_en = {
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
  private static _resolver: ValidationMessageResolver | null = null;

  private static _globalTemplate: {
    fn: (control: AbstractControl, element: HTMLElement, messages: ValidationMessageVM[]) => string;
    placeholders: GlobalTemplatePlaceholders;
  } | null = null;

  private static _cssConfig: ValidationCssConfig = {
    invalidClass: 'is-invalid',
    errorContainerClass: 'invalid-feedback'
  };

  static setMessageResolver(resolver: ValidationMessageResolver | null) {
    this._resolver = resolver;
  }

  static defineGlobalTemplate(
    templateOrFn: string | ((control: AbstractControl, element: HTMLElement, messages: ValidationMessageVM[]) => string),
    placeholders?: GlobalTemplatePlaceholders
  ): void {
    const defaultPlaceholders: GlobalTemplatePlaceholders = {
      message: 'ErrorPlaceHolder',
      controlKey: 'ctrlKey'
    };

    const cfgPlaceholders: GlobalTemplatePlaceholders = {
      ...defaultPlaceholders,
      ...(placeholders || {})
    };

    if (typeof templateOrFn === 'string') {
      const tmpl = templateOrFn;
      this._globalTemplate = {
        fn: () => tmpl,
        placeholders: cfgPlaceholders
      };
    } else {
      this._globalTemplate = {
        fn: templateOrFn,
        placeholders: cfgPlaceholders
      };
    }
  }

  static setCssConfig(config: ValidationCssConfig): void {
    this._cssConfig = { ...this._cssConfig, ...(config || {}) };
  }

  static get cssConfig(): ValidationCssConfig {
    return this._cssConfig;
  }

  static getErrorMessage(control: FormControl): string {
    if (control.errors) {
      for (const errorKey of Object.keys(ErrorTypes) as ErrorKey[]) {
        const code = ErrorTypes[errorKey];
        const errValue = (control.errors as any)[code];
        if (errValue) {
          return this.resolveMessage({
            key: errorKey,
            code,
            error: errValue,
            defaultTemplate: DefaultErrors_en[errorKey],
            control
          });
        }
      }
    }

    return 'Invalid field';
  }

  static errors$(control: AbstractControl): Observable<ValidationMessageVM[]> {
    return merge(control.statusChanges, control.valueChanges ?? []).pipe(
      startWith(null),
      map(() => this.buildMessages(control))
    );
  }

  static getMessages(control: AbstractControl): ValidationMessageVM[] {
    return this.buildMessages(control);
  }

  static buildGlobalTemplate(params: {
    control: AbstractControl;
    element: HTMLElement;
    controlKey?: string;
  }): string | null {
    if (!this._globalTemplate) return null;
    const messages = this.getMessages(params.control);
    if (!messages.length) return null;

    const { fn, placeholders } = this._globalTemplate;
    const raw = fn(params.control, params.element, messages);
    const primary = messages[0];

    let result = raw;

    if (placeholders.message) {
      const reMessage = new RegExp(placeholders.message, 'g');
      result = result.replace(reMessage, primary.message);
    }

    if (placeholders.controlKey && params.controlKey) {
      const reKey = new RegExp(placeholders.controlKey, 'g');
      result = result.replace(reKey, params.controlKey);
    }

    return result;
  }

  private static buildMessages(control: AbstractControl): ValidationMessageVM[] {
    const errors = control.errors || {};
    const result: ValidationMessageVM[] = [];

    for (const errorKey of Object.keys(ErrorTypes) as ErrorKey[]) {
      const code = ErrorTypes[errorKey];
      const errValue = (errors as any)[code];
      if (errValue) {
        const message = this.resolveMessage({
          key: errorKey,
          code,
          error: errValue,
          defaultTemplate: DefaultErrors_en[errorKey],
          control
        });
        result.push({ key: errorKey, code, message, value: errValue });
      }
    }

    return result;
  }

  private static resolveMessage(params: {
    key: ErrorKey;
    code: ErrorCode;
    error: any;
    defaultTemplate: string;
    control: AbstractControl;
  }): string {
    const { key, code, error, defaultTemplate, control } = params;

    if (this._resolver) {
      try {
        return this._resolver({ key, code, error, defaultTemplate, control });
      } catch {
        // fall back to default behavior on resolver errors
      }
    }

    return this.formatWithPlaceholders(defaultTemplate, error);
  }

  private static formatWithPlaceholders(template: string, errorValue?: any): string {
    if (!template) {
      return 'Unknown error';
    }

    if (errorValue !== null && typeof errorValue === 'object') {
      return template.replace(/{([^}]+)}/g, (_, path: string) => {
        const parts = path.split('.');
        let value: any = errorValue;
        for (const p of parts) {
          value = value ? value[p] : undefined;
        }
        return value ?? '';
      });
    }

    return template;
  }

  static addErrorType(type: ErrorKey | string, message: string): void {
    (ErrorTypes as any)[type] = type;
    (DefaultErrors_en as any)[type] = message;
  }
}
    `;
  }
}