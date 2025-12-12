# 🚀 Big Release: angular-formsbuilder-gen 2.0.0 – Major Upgrade with Advanced Validation Ecosystem, New Angular Module, and AI‑Ready Documentation

## TL;DR
We’re shipping **angular-formsbuilder-gen 2.0.0**, a major version featuring:
- Centralized ValidationManager with typed errors, localization hooks, and customizable global error templates
- New Angular UI helpers: pipes, reusable component, auto‑error directive, and the *ForFormArray structural directive
- AutoFormsBuilderModule with forRoot‑style configuration and runtime config access
- CLI `init` command to scaffold swagger.json
- Comprehensive README rewrite for SEO and npm visibility
- Added an LLM guidance file to help AI assistants understand the project
- Stronger FormArray typings and edge‑case handling
- Optional cleanup of orphan generated files
- Model filtering (include/exclude) and validation‑messages JSON export

---

## 🎯 What This Release Solves

Before 2.0, the generator produced basic FormBuilder services with minimal validation support. Teams had to:
- Write repetitive error‑display logic in every component
- Manually wire up validation messages and i18n
- Handle FormArray iteration with verbose *ngFor + formArrayName + formGroupName boilerplate
- Keep generated files in sync manually

With 2.0, you get a **complete validation ecosystem** and **developer‑experience upgrades** out of the box.

---

## ✨ Major New Features

### 1. Centralized ValidationManager
- **Typed error keys** (`ErrorTypes`, `ErrorKey`, `ErrorCode`) for better IntelliSense.
- Default English messages with placeholders like `{requiredLength}`.
- **Message resolver hook** to plug in your own i18n/branding.
- **Global error HTML template** with placeholders, auto‑filled per control.
- **CSS class customization** (defaults: Bootstrap 5 `is-invalid`/`invalid-feedback`).

```ts
ValidationManager.setMessageResolver(({ key, error, defaultTemplate }) => {
  const translationKey = `validation.${key}`;
  return myTranslate(translationKey, error) ?? defaultTemplate;
});
```

### 2. UI Helpers for Errors
- `ValidationErrorPipe` – get the first error message.
- `ValidationErrorsPipe` – get all messages.
- `<afb-validation-errors>` component – reusable error list.
- `AfbAutoErrorsDirective` – auto‑appends global error templates and extends `FormGroup` with `showValidationErrors()`.
- `*ForFormArray` structural directive – simplifies iterating over FormArrays with optional index binding and strong typing.

```html
<form [formGroup]="form" afbAutoErrors>
  <div *ForFormArray="'addresses'; let group; index as i">
    <div [formGroup]="group">
      <input formControlName="street" />
    </div>
  </div>
</form>
```

### 3. AutoFormsBuilderModule (forRoot‑style config)
- Declares/exports all validation UI helpers.
- Global configuration via `AutoFormsBuilderModule.init(config)`.
- Runtime config access via static getter `AutoFormsBuilderModule.Configs`.

```ts
@NgModule({
  imports: [
    ReactiveFormsModule,
    AutoFormsBuilderModule.init({
      cssConfig: { invalidClass: 'is-invalid', errorContainerClass: 'invalid-feedback' },
      messageResolver: myResolver,
      globalTemplate: { template: myTemplate, placeholders: { message: 'ErrorPlaceHolder' } }
    })
  ]
})
export class AppModule {}
```

### 4. CLI `init` Command
- Scaffold an initial `swagger.json` in the current directory.
- Supports custom filename.
- Avoids overwriting existing files.

```sh
ng-frmGenerator init
ng-frmGenerator init my-config.json
```

### 5. README & Documentation Overhaul
- SEO‑optimized structure and keywords.
- Clear Quick Start and feature sections.
- Examples for every new feature.
- Added a **Roadmap** section mentioning upcoming internal model creation.

### 6. LLM Guidance File
- New `LLM` file at repo root to help AI assistants understand the project.
- Documents purpose, config, generated files, conventions, and safe‑change guidelines.
- Not used at runtime—purely for AI tooling.

### 7. Stronger FormArray Typing & Edge Cases
- `FormArray<FormGroup>` for object arrays; `FormArray<FormControl>` for primitive/enum arrays.
- Fixed primitive `addNewX` to return the same `FormControl` that’s pushed.
- Patch logic now clears the array before adding items to avoid duplicates.

### 8. Housekeeping & Filtering
- `cleanupUnusedFiles`: remove obsolete generated form files.
- `includeModels` / `excludeModels`: whitelist/blacklist models.
- `generateValidationMessagesJson`: emit `validation-messages.en.json` for i18n pipelines.

---

## 🛠️ How to Upgrade

1. Update your package:
   ```sh
   npm install angular-formsbuilder-gen@2.0.0
   ```

2. (Optional) Run `ng-frmGenerator init` to refresh your config with new flags.

3. If you use the validation UI helpers, import the new module in your root module and configure it:
   ```ts
   import { AutoFormsBuilderModule } from './forms/AutoFormsBuilderModule';
   @NgModule({
     imports: [ReactiveFormsModule, AutoFormsBuilderModule.init(myConfig)]
   })
   export class AppModule {}
   ```

4. Replace manual FormArray iteration with `*ForFormArray` for cleaner templates.

5. Update any custom CSS selectors to match the new defaults (`is-invalid`/`invalid-feedback`), or customize via `ValidationManager.setCssConfig`.

---

## 📦 What’s Inside the Box

- One `*FormBuilder` service per model (as before)
- `FormsHelpers.ts`, `CustomeValidators.ts`, `ValidationManager.ts`
- `ValidationUiHelpers.ts` (pipes, component, directives, `*ForFormArray`)
- `AutoFormsBuilderModule.ts` (NgModule with forRoot config)
- `FormsExtensions.d.ts` (augments `FormGroup` with `showValidationErrors`)
- Optional `validation-messages.en.json` for i18n
- New `LLM` guidance file for AI assistants

---

## 🧭 Roadmap

- **Next version**: Option to generate TypeScript models directly from OpenAPI (no external `ng-openapi-gen` required).

---

## 🎉 Thank You

This release is the culmination of community feedback and real‑world usage. We hope the new validation ecosystem, DX improvements, and documentation make your Angular form development faster and more enjoyable.

👉 Try it now: `npm i angular-formsbuilder-gen@2.0.0` and run `ng-frmGenerator init` to get started!
