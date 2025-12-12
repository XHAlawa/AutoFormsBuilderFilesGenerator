# angular-formsbuilder-gen – Angular Reactive Forms Generator from OpenAPI

[![Socket Badge](https://socket.dev/api/badge/npm/package/angular-formsbuilder-gen)](https://socket.dev/npm/package/angular-formsbuilder-gen)

Generate strongly-typed Angular Reactive Forms (and optional Signals-based forms) directly from your OpenAPI / Swagger schema. This package works together with `ng-openapi-gen` to turn backend API contracts into ergonomic form builder services with rich validation and UI helpers.

- Build reactive forms for every model in your API in seconds.
- Keep forms in sync with your OpenAPI schema as it evolves.
- Standardize validation messages and Bootstrap 5–ready error UI across your app.

## Features

- **Angular reactive forms generator from OpenAPI** – create `FormGroup`-based builders for each schema model.
- **Optional Angular Signals templates** – generate form builders that expose Signals-based state for Angular 17+.
- **Advanced validation ecosystem** – centralized `ValidationManager`, typed error keys, placeholders, and i18n-ready messages.
- **UI helpers for errors** – pipes, reusable `<afb-validation-errors>` component, and `afbAutoErrors` directive with `form.showValidationErrors()`.
- **Bootstrap 5 default styling** – uses `is-invalid` and `invalid-feedback` by default, fully customizable via config APIs.
- **Template customization** – plug in your own form templates or copy the built-ins with `--customize`.
- **Configurable generation** – include/exclude models, clean up unused generated files, and emit validation messages JSON for translation tools.
- **Works with ng-openapi-gen** – reuse the same `swagger.json` configuration to generate both API clients and form builders.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Configuration Options](#configuration-options)
- [Generating Angular API Services and Models](#generating-angular-api-services-and-models)
- [Generating Reactive FormsBuilder Classes](#generating-reactive-formsbuilder-classes)
- [Example of Generated FormBuilder Class](#example-of-generated-formbuilder-class)
- [Validation Ecosystem (Error Handling & Messages)](#validation-ecosystem-error-handling--messages)
- [AutoFormsBuilderModule (Angular module & config)](#autoformsbuildermodule-angular-module--config)
- [What Is New?](#what-is-new)
- [Features (Detailed)](#features-detailed)
- [LLM Guidance](#llm-guidance)

---

## Installation

### Installing the Module

To install "angular-formsbuilder-gen" globally or within your project, run the following commands:

```sh
npm install -g ng-openapi-gen
npm install -g angular-formsbuilder-gen
```

## Quick Start

1. **Initialize a configuration file** (optional but recommended):

   ```sh
   ng-frmGenerator init
   ```

   This creates a `swagger.json` in the current folder with sensible defaults. You can also use a custom name:

   ```sh
   ng-frmGenerator init my-swagger.json
   ```

2. **Generate Angular API services and models** using `ng-openapi-gen`:

   ```sh
   ng-openapi-gen -c swagger.json
   ```

3. **Generate reactive form builder classes** from the same config:

   ```sh
   ng-frmGenerator swagger.json
   ```

   If your config file is named `swagger.json` in the current folder, you can also just run:

   ```sh
   ng-frmGenerator
   ```

4. **Use the generated form builder in your Angular component**:

   ```ts
   @Component({
     selector: 'app-user-form',
     templateUrl: './user-form.component.html',
     providers: [CustomerDtoFormBuilder.provider()]
   })
   export class UserFormComponent {
     form = this.customerFormBuilder.buildForm();

     constructor(private customerFormBuilder: CustomerDtoFormBuilder) {}

     submit() {
       this.form.showValidationErrors();
       if (this.form.invalid) {
         return;
       }
       const model = this.form.value;
       // send model to API
     }
   }
   ```

   ```html
   <form [formGroup]="form" afbAutoErrors (ngSubmit)="submit()">
     <!-- your controls here -->
     <button type="submit" class="btn btn-primary">Save</button>
   </form>
   ```

5. **Optionally enable Signals-based templates** by setting `"useSignalFormTemplates": true` in `swagger.json`.

## Configuration

You can **manually** create a configuration file named `swagger.json` in the root of your Angular app with the following content, or let the CLI scaffold it for you (see below):

```json
{
  "$schema": "node_modules/ng-openapi-gen/ng-openapi-gen-schema.json",
  "input": "https://localhost:44325/swagger/v1/swagger.json",
  "output": "./src/app/api",
  "ignoreUnusedModels": false,

  "modelsPath": "./../api/models",
  "formsOutput": "/src/app/forms",
  "schemeFile": "E://swagger.json",

  "useEnumValuesAsString": false,
  "useSignalFormTemplates": false,

  "generateFormsHelpers": true,
  "generateCustomValidators": true,
  "generateValidationManager": true,
  "generateShowForErrorDirective": true,
  "generateIFormBuilder": true,
  "generateDateHelper": true,
  "generateEnumHelper": true,

  "customFormTemplatePath": "",
  "customSignalFormTemplatePath": "",

  "generateValidationUiHelpers": true,
  "cleanupUnusedFiles": true,
  "includeModels": [],
  "excludeModels": [],
  "generateValidationMessagesJson": true
}
```

Note: This file is also used by the  [**ng-openapi-gen** ](https://www.npmjs.com/package/ng-openapi-gen  "Click For more information") tool. 

### Quick start: scaffold swagger.json via CLI

Instead of creating `swagger.json` by hand, you can ask the generator to create an initial file for you:

```sh
ng-frmGenerator init
```

This will create `swagger.json` in the current folder using the same defaults shown above.

You can also specify a custom file name:

```sh
ng-frmGenerator init my-config.json
```

If the target file already exists, the command will print a message and exit without overwriting it.

## Configuration Options

Our tool specifically uses the properties below:

- **input**: URL for the OpenAPI schema JSON file.
- **schemeFile**: Local path for the schema JSON file, which takes precedence if it exists.
- **modelsPath**: Path for generated models from ng-openapi-gen.
- **formsOutput**: Path for generated FormBuilder classes.
- **useEnumValuesAsString** (optional): When `true`, generated enum fields will use string values instead of enum member references.
- **useSignalFormTemplates** (optional): When `true`, generates form builder classes that also expose Angular Signals-based state (`formValueSignal`, `isValidSignal`) on top of reactive forms. Intended for Angular 17+.
- **generateFormsHelpers** (optional, default `true`): Control whether `FormsHelpers.ts` is generated.
- **generateCustomValidators** (optional, default `true`): Control whether `CustomeValidators.ts` is generated.
- **generateValidationManager** (optional, default `true`): Control whether `ValidationManager.ts` is generated.
- **generateShowForErrorDirective** (optional, default `true`): Control whether `ShowForErrorDirective.ts` is generated.
- **generateIFormBuilder** (optional, default `true`): Control whether `IFormBuilder.ts` is generated.
- **generateDateHelper** (optional, default `true`): Control whether `DateHelper.ts` is generated.
- **generateEnumHelper** (optional, default `true`): Control whether `EnumHelper.ts` is generated.
- **customFormTemplatePath** (optional): Path to a Node module that exports a `getTemplate(key, services)` function (or `formBuilderTemplate.getTemplate`). When provided and `useSignalFormTemplates` is `false`, this function is used to generate the form builder class instead of the built-in template.
- **customSignalFormTemplatePath** (optional): Same as `customFormTemplatePath`, but used when `useSignalFormTemplates` is `true`.
- **generateValidationUiHelpers** (optional, default `true`): Control whether `ValidationUiHelpers.ts` (pipes + `<afb-validation-errors>` component and `afbAutoErrors` directive) is generated.
- **cleanupUnusedFiles** (optional, default `true`): When `true`, remove `.ts` files under `formsOutput` that no longer correspond to current schema models or enabled helpers.
- **includeModels** (optional): Array of model names to generate forms for. When set, only these models are processed.
- **excludeModels** (optional): Array of model names to skip when generating forms.
- **generateValidationMessagesJson** (optional, default `true`): When `true`, generate `validation-messages.en.json` containing default validation messages for easy integration with i18n tools.

---

## Generating Angular API Services and Models

First, generate services and models using **ng-openapi-gen** :
```sh
ng-openapi-gen -c swagger.json
```
Ensure that files are generated in the "output" path defined in swagger.json.

---

## Generating Reactive FormsBuilder Classes

To generate Angular models' FormBuilder classes, execute the following command:
```sh
ng-frmGenerator swagger.json
or
ng-frmGenerator
```

only because default filename for configuration is **"swagger.json"**

---

## Example of Generated FormBuilder Class

Here is an example of a generated FormBuilder class for a simple user information form:
```typescript
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormArray, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { IFormBuilder } from './IFormBuilder';
import { CustomerDto, UserAddressDto } from './../api/models';
import { UserAddressDtoFormBuilder } from './UserAddressDto';
import { oneOfValidator, guidValidator } from  './CustomeValidators'; 
  
@Injectable({ providedIn: 'root' })
export class CustomerDtoFormBuilder implements IFormBuilder<CustomerDto> {

  DatePipe: DatePipe = null as any;
  DateFormat: string = 'yyyy-MM-dd';
  form: FormGroup = null as any;

  constructor(private fb: FormBuilder
    , private UserAddressDtoFormBuilderSrvc: UserAddressDtoFormBuilder
  ) {
    this.DatePipe = new DatePipe('en-US');
  }
  
  updateCulture(culture: string = 'en-US') {
    this.DatePipe = new DatePipe(culture);  
  }

  resetForm() {
    this.form.reset();
  }

  buildForm(model: CustomerDto | null = null) {
    this.form = this.fb.group({
      userName: [ '' , Validators.compose([ Validators.required, Validators.minLength(1) ]) ],
      password: [ '' , Validators.compose([ Validators.required ]) ],
      addresses: [ this.UserAddressDtoFormBuilderSrvc.buildForm() ],
    });
    if (model != null) {
      this.form.patchValue({ ...model });
    }
    return this.form;
  }
 
  get userNameCtrl(): FormControl {
    return this.form.get('userName') as FormControl;
  }
 
  get userNameValueChanges$() {
    return this.userNameCtrl?.valueChanges;
  }
   
  get passwordCtrl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get passwordValueChanges$() {
    return this.passwordCtrl?.valueChanges;
  }

  addressesArray():  FormArray {

    return  this.form.controls['addresses'] as  FormArray;

  }

  addressesControls():  AbstractControl<any, any>[] {

    return  this.addressesArray().controls;

  }

  deleteAddressesByIndex(index:  number):  void {
    this.addressesArray().removeAt(index);
  }

  addNewAddresses(model:  UserAddressDtoFormBuilder  |  null  =  null):  FormGroup<any> {
    let  frm  =  this.UserAddressDtoFormBuilderSrvc.buildForm(model);
    this.addressesArray().push(frm);
    return  frm;
  }

  addNewaddresses(model: UserAddressDto | null = null): FormGroup<any> {
    let frm = this.UserAddressDtoFormBuilderSrvc.buildForm(model);
    this.addressesArray().push(frm);
    return frm;
  }
}

---

## Validation Ecosystem (Error Handling & Messages)

This generator ships a rich validation ecosystem to help you standardize error handling across your Angular app.

### Centralized ValidationManager

Generated file: `ValidationManager.ts`

- Exposes **typed error keys** via `ErrorTypes` / `ErrorKey` / `ErrorCode`.
- Provides default English messages with placeholders (e.g. `{requiredLength}`, `{min}`, `{max}`).
- Core APIs:

```ts
ValidationManager.getErrorMessage(control: FormControl): string;
ValidationManager.getMessages(control: AbstractControl): ValidationMessageVM[];
ValidationManager.errors$(control: AbstractControl): Observable<ValidationMessageVM[]>;
```

You can plug in your own localization/branding using the **message resolver hook**:

```ts
ValidationManager.setMessageResolver(({ key, code, error, defaultTemplate, control }) => {
  // key: 'Required' | 'MinLength' | ...
  // code: 'required' | 'minlength' | ...
  // error: Angular error object (e.g. { requiredLength, actualLength })
  // defaultTemplate: e.g. 'Minimum length is {requiredLength} characters'

  // Example: integrate with your i18n service
  const translationKey = `validation.${key}`;
  return myTranslate(translationKey, error) ?? defaultTemplate;
});
```

### Global Error HTML Template

You can define a **global error template** that will be auto-filled with the primary error message and control key.

```ts
ValidationManager.defineGlobalTemplate(
  (control, element, messages) => `
    <div class="invalid-feedback" for="ctrlKey">
      ErrorPlaceHolder
    </div>
  `,
  {
    message: 'ErrorPlaceHolder', // will be replaced with the first error message
    controlKey: 'ctrlKey'        // will be replaced with the control name
  }
);
```

At runtime you can build the resolved HTML for a specific control/element:

```ts
const html = ValidationManager.buildGlobalTemplate({
  control: myControl,
  element: myInputElement,
  controlKey: 'userName'
});
```

### Validation UI Helpers (Pipes, Component, Directive)

Generated file: `ValidationUiHelpers.ts` (enabled when `generateValidationUiHelpers: true`). It contains:

- `ValidationErrorPipe` – returns the first error message for a control.

  ```html
  <div *ngIf="userNameCtrl | validationError as err">
    {{ err }}
  </div>
  ```

- `ValidationErrorsPipe` – returns all messages (`ValidationMessageVM[]`).

  ```html
  <ul *ngIf="userNameCtrl | validationErrors as errs">
    <li *ngFor="let e of errs">{{ e.message }}</li>
  </ul>
  ```

- `ValidationErrorsComponent` – reusable error list component:

  ```html
  <afb-validation-errors [control]="userNameCtrl" [showAll]="false"></afb-validation-errors>
  ```

- `AfbAutoErrorsDirective` – attaches to a form and automatically appends the global error template next to invalid controls and also extends the `FormGroup` with a helper method:

  ```html
  <!-- auto show errors on submit -->
  <form [formGroup]="form" afbAutoErrors>
    ...
  </form>

  <!-- manual mode: trigger from code -->
  <form [formGroup]="form" [afbAutoErrors]="'manual'">
    ...
  </form>
  ```

  ```ts
  // in your component
  this.form.showValidationErrors();
  // or without HTML injection
  this.form.showValidationErrors({ generateHtml: false });
  ```

- `ForFormArray` – structural directive to iterate over a `FormArray` by path on the parent `FormGroup`:

  ```html
  <form [formGroup]="form">
    <div *ForFormArray="'addresses'; let group; index as i">
      <div [formGroup]="group">
        <input formControlName="street" />
        <button type="button" (click)="addressesArray().removeAt(i)">Remove</button>
      </div>
    </div>
  </form>
  ```

By default, it uses **Bootstrap 5** classes:

- `is-invalid` for invalid form controls
- `invalid-feedback` for auto-generated error containers

You can also customize the CSS classes used for invalid controls and auto-generated error containers:

```ts
ValidationManager.setCssConfig({
  invalidClass: 'my-invalid-class',
  errorContainerClass: 'my-error-container'
});
```

These helpers let you standardize error output while still giving you full control over localization, styling, and UI.

---

## AutoFormsBuilderModule (Angular module & config)

When `generateValidationUiHelpers: true`, the generator also creates `AutoFormsBuilderModule.ts`, which exposes a ready-to-use Angular module for all validation UI features.

- Declares and exports:
  - `ValidationErrorPipe` and `validationErrors` pipe
  - `<afb-validation-errors>` component
  - `afbAutoErrors` directive
  - `ForFormArray` structural directive
- Supports global configuration via a static `init` method.

### Root module usage

```ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoFormsBuilderModule, AutoFormsBuilderConfig } from './forms/AutoFormsBuilderModule';

@NgModule({
  imports: [
    ReactiveFormsModule,
    AutoFormsBuilderModule.init({
      cssConfig: {
        invalidClass: 'is-invalid',
        errorContainerClass: 'invalid-feedback'
      },
      messageResolver: ({ key, error, defaultTemplate }) => {
        const translationKey = `validation.${key}`;
        return myTranslate(translationKey, error) ?? defaultTemplate;
      },
      globalTemplate: {
        template: (control, element, messages) => `
          <div class="invalid-feedback">
            ErrorPlaceHolder
          </div>
        `,
        placeholders: {
          message: 'ErrorPlaceHolder'
        }
      }
    } as AutoFormsBuilderConfig)
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In **feature modules**, import the module without calling `init` again:

```ts
@NgModule({
  imports: [AutoFormsBuilderModule]
})
export class FeatureModule {}
```

---

## What Is New?  
#### Version 1.0.64
   - Fix generated enum keys (Git Hub: Issue #8)
#### Version 1.0.64
   - Add Template To Handle Array Of Enum Values 
#### Version 1.0.62
   - Fix Issue Of Patching Arrays Values
   - Fix Issue Of Providers Dependency

* Fix Issue Where Enums In Some Cases Injected As Form builder
* New Features
	* EnumHelper
		* nameToSatetment: Converts Enum Pascal Key Into Readable Text Example: UserFinanceCompleted ->  'User Finance Completed'
		* getValByName: Gets Value Of Enum Key Example: { red: 2 } -> getValByName('red') return 2
		* getNameByVal: Gets Value Of Enum Key Example: { red: 2 } -> getNameByVal(2) return 'red'
		* getAllEnumValues: Returns All Values Of Enum Example: { red: 2, blue:5 } return [ 2, 5 ]
		* getAllEnumNames: Returns All Names Of Enum Example: { red: 2, blue:5 } return [ 'red', 'blue' ]
		* hasValue: Checks If Enum Has Value Example: { red: 2 } -> HasValue(2) return true
		* hasName: Checks If Enum Has Name Example: { red: 2 } -> hasName('red') return true
		* ToKeyValArray: Returns List Of { key, value } Of Enum Example: { red: 2, blue:5 } 
			returns [ { key: 'red', value: 2 } ] useful in cases of using enum as data source for drop down
	* DateHelper
		* addDays: Add Number Of Days To Date
		* addMonths: Add Number Of Months To Date
		* addYears: Add Number Of Years To Date
		* diffInDays: Get Diff Between Two Dates In Days
		* diffInMonths: Get Diff Between Two Dates In Months
		* diffInYears: Get Diff Between Two Dates In Years
	* ShowForErrorDirective
		* showForError: used to show dome if control has sepcific error
		```
		<form [formGroup]="myFormGroup">
  			<!-- Other form elements -->
		  	<div showForError="required" formControlName="controlName">
    		This will show if 'invalidCharacters' error exists.
  			</div>
  			<!-- Other form elements -->
		</form>
		```
---
## Features (Detailed)

- Generate Angular **FormBuilder** classes for all models defined in your OpenAPI schema.
- Extend generated classes by inheritance in a separate service file so your custom logic stays upgrade-safe.
- Get strongly-typed control getters for better IntelliSense and refactoring support.
- Dramatically increase productivity by automating repetitive **reactive forms** setup so you can focus on your business logic instead of boilerplate.

---

## Roadmap

- The next version is planned to include an option for **internal creation of models**, so you can let this generator produce TypeScript models directly from the OpenAPI schema without relying on an external models generator.

---

## LLM Guidance

This repository includes an `LLM` file at the project root. It is a plain-text guide for AI coding assistants (LLMs) that:

- Explains the overall purpose of the generator and how it works with `ng-openapi-gen`.
- Describes key config options (`IParsedConfig`), the template system, and the generated runtime files.
- Documents important conventions (no comments in generated code, stable filenames/APIs) and safe-change guidelines.

The `LLM` file is **not used at runtime**. It exists only to help AI tools understand the project and make safer, more accurate changes when you ask them to modify this codebase.