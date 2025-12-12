export class autoFormsBuilderModuleTemplate {
  static getTemplate() {
    return `
import { NgModule, ModuleWithProviders, InjectionToken, Inject, Optional } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  ValidationManager,
  ValidationMessageVM,
  ValidationCssConfig,
  ValidationMessageResolver,
  GlobalTemplatePlaceholders
} from './ValidationManager';
import {
  ValidationErrorPipe,
  ValidationErrorsPipe,
  ValidationErrorsComponent,
  AfbAutoErrorsDirective,
  ForFormArrayDirective
} from './ValidationUiHelpers';

export interface AutoFormsBuilderConfig {
  cssConfig?: ValidationCssConfig;
  messageResolver?: ValidationMessageResolver;
  globalTemplate?: {
    template: string | ((control: AbstractControl, element: HTMLElement, messages: ValidationMessageVM[]) => string);
    placeholders?: GlobalTemplatePlaceholders;
  };
}

export const AUTO_FORMS_BUILDER_CONFIG = new InjectionToken<AutoFormsBuilderConfig>('AUTO_FORMS_BUILDER_CONFIG');

@NgModule({
  declarations: [
    ValidationErrorPipe,
    ValidationErrorsPipe,
    ValidationErrorsComponent,
    AfbAutoErrorsDirective,
    ForFormArrayDirective
  ],
  exports: [
    ValidationErrorPipe,
    ValidationErrorsPipe,
    ValidationErrorsComponent,
    AfbAutoErrorsDirective,
    ForFormArrayDirective
  ]
})
export class AutoFormsBuilderModule {
  private static _configs: AutoFormsBuilderConfig | null = null;

  static get Configs(): AutoFormsBuilderConfig | null {
    return AutoFormsBuilderModule._configs;
  }

  static init(config: AutoFormsBuilderConfig): ModuleWithProviders<AutoFormsBuilderModule> {
    return {
      ngModule: AutoFormsBuilderModule,
      providers: [
        { provide: AUTO_FORMS_BUILDER_CONFIG, useValue: config }
      ]
    };
  }

  constructor(@Optional() @Inject(AUTO_FORMS_BUILDER_CONFIG) config: AutoFormsBuilderConfig | null) {
    if (config) {
      AutoFormsBuilderModule._configs = config;
      if (config.cssConfig) {
        ValidationManager.setCssConfig(config.cssConfig);
      }
      if (config.messageResolver) {
        ValidationManager.setMessageResolver(config.messageResolver);
      }
      if (config.globalTemplate) {
        ValidationManager.defineGlobalTemplate(config.globalTemplate.template, config.globalTemplate.placeholders);
      }
    }
  }
}
`;
  }
}
