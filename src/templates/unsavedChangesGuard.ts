export class unsavedChangesGuardTemplate {
    static getTemplate() {
        return `
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { IFormBuilder } from './IFormBuilder';

export interface HasUnsavedChanges {
  formBuilder: IFormBuilder<any>;
  canDeactivateMessage?: string;
}

/**
 * Route guard that prompts the user before navigating away from a dirty form.
 *
 * @example
 * // In your route config:
 * { path: 'edit', component: EditComponent, canDeactivate: [UnsavedChangesGuard] }
 *
 * // In your component:
 * export class EditComponent implements HasUnsavedChanges {
 *   constructor(public formBuilder: UserFormBuilder) {}
 *   canDeactivateMessage = 'You have unsaved changes. Leave anyway?';
 * }
 */
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {

  canDeactivate(
    component: HasUnsavedChanges
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!component.formBuilder || !component.formBuilder.form) {
      return true;
    }

    if (component.formBuilder.form.dirty) {
      const message = component.canDeactivateMessage
        ?? 'You have unsaved changes. Are you sure you want to leave?';
      return confirm(message);
    }

    return true;
  }
}
`;
    }
}
