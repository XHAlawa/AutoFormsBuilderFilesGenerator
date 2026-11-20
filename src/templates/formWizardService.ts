export class formWizardTemplate {
    static getTemplate() {
        return `
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { IFormBuilder } from './IFormBuilder';

export interface WizardStep {
  index: number;
  label: string;
  fields: string[];
}

export class FormWizard<T> {
  private _currentStepIndex = 0;
  private _steps: WizardStep[] = [];
  private _formBuilder: IFormBuilder<T>;
  private _stepGroups: Map<number, FormGroup> = new Map();
  private _stepChange$ = new Subject<{ from: number; to: number }>();

  constructor(formBuilder: IFormBuilder<T>) {
    this._formBuilder = formBuilder;
  }

  /**
   * Define a wizard step using typed property selectors for IntelliSense support.
   *
   * @example
   * const wizard = new FormWizard<UserModel>(userFormBuilder)
   *   .setStep(1, [a => a.userName, a => a.fullName])
   *   .setStep(2, [a => a.password, a => a.repeatPassword], 'Security');
   */
  setStep(index: number, fields: ((model: T) => any)[], label?: string): this {
    const fieldNames = fields.map(fn => this.extractFieldName(fn));
    const existing = this._steps.findIndex(s => s.index === index);
    const step: WizardStep = { index, label: label ?? 'Step ' + index, fields: fieldNames };
    if (existing >= 0) {
      this._steps[existing] = step;
    } else {
      this._steps.push(step);
      this._steps.sort((a, b) => a.index - b.index);
    }
    return this;
  }

  private extractFieldName(fn: (model: T) => any): string {
    let captured = '';
    const proxy = new Proxy({} as any, {
      get(_: any, prop: string) {
        captured = prop;
        return undefined;
      }
    });
    fn(proxy);
    return captured;
  }

  get steps(): WizardStep[] {
    return this._steps;
  }

  get currentStep(): WizardStep {
    return this._steps[this._currentStepIndex];
  }

  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  get totalSteps(): number {
    return this._steps.length;
  }

  get isFirstStep(): boolean {
    return this._currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this._currentStepIndex === this._steps.length - 1;
  }

  get progress(): number {
    if (this._steps.length === 0) return 0;
    return Math.round(((this._currentStepIndex + 1) / this._steps.length) * 100);
  }

  get form(): FormGroup {
    return this._formBuilder.form;
  }

  buildForm(model: T | null = null): FormGroup {
    this._stepGroups.clear();
    return this._formBuilder.buildForm(model);
  }

  /**
   * Returns a FormGroup containing only the controls for the given step,
   * with optional initial values and additional custom controls.
   * The step group stays in sync with the main form — schema controls
   * share actual references, so changes flow both ways automatically.
   *
   * @example
   * const step1 = wizard.buildStep(1, { userName: 'John' }, [
   *   { name: 'agreedToTerms', control: new FormControl(false, Validators.requiredTrue) },
   *   { name: 'captcha' }
   * ]);
   */
  buildStep(
    stepIndex: number,
    initialValues?: Partial<T>,
    additionalControls?: { name: string; control?: AbstractControl }[]
  ): FormGroup {
    const step = this._steps.find(s => s.index === stepIndex);
    if (!step) throw new Error('Wizard step ' + stepIndex + ' not defined. Call setStep() first.');
    if (!this._formBuilder.form) throw new Error('Call buildForm() before buildStep().');

    if (this._stepGroups.has(stepIndex)) {
      const existing = this._stepGroups.get(stepIndex)!;
      if (initialValues) existing.patchValue(initialValues as any);
      if (additionalControls) {
        additionalControls.forEach(ac => {
          if (!existing.contains(ac.name)) {
            existing.addControl(ac.name, ac.control ?? new FormControl());
          }
        });
      }
      return existing;
    }

    const controls: { [key: string]: AbstractControl } = {};
    step.fields.forEach(field => {
      const mainCtrl = this._formBuilder.form.get(field);
      if (mainCtrl) {
        controls[field] = mainCtrl;
      }
    });

    if (additionalControls) {
      additionalControls.forEach(ac => {
        controls[ac.name] = ac.control ?? new FormControl();
      });
    }

    const stepGroup = new FormGroup(controls);
    this._stepGroups.set(stepIndex, stepGroup);

    if (initialValues) {
      stepGroup.patchValue(initialValues as any);
    }

    return stepGroup;
  }

  /**
   * Add a control to an existing step group at runtime.
   * Supports typed selector for IntelliSense or plain string for custom names.
   *
   * @example
   * wizard.addControlToStep(1, a => a.email, new FormControl('', Validators.email));
   * wizard.addControlToStep(1, 'captchaToken');
   */
  addControlToStep(stepIndex: number, field: ((model: T) => any) | string, control?: AbstractControl): void {
    const group = this._stepGroups.get(stepIndex);
    if (!group) throw new Error('Step ' + stepIndex + ' not built yet. Call buildStep() first.');
    const name = typeof field === 'string' ? field : this.extractFieldName(field);
    group.addControl(name, control ?? new FormControl());
  }

  /**
   * Remove a control from a step group.
   * Supports typed selector for IntelliSense or plain string.
   *
   * @example
   * wizard.removeControlFromStep(1, a => a.email);
   * wizard.removeControlFromStep(1, 'captchaToken');
   */
  removeControlFromStep(stepIndex: number, field: ((model: T) => any) | string): void {
    const group = this._stepGroups.get(stepIndex);
    if (!group) return;
    const name = typeof field === 'string' ? field : this.extractFieldName(field);
    if (group.contains(name)) {
      group.removeControl(name);
    }
  }

  getStepGroup(stepIndex: number): FormGroup | null {
    return this._stepGroups.get(stepIndex) ?? null;
  }

  isCurrentStepValid(): boolean {
    if (!this._formBuilder.form || this._steps.length === 0) return false;
    return this.isStepValid(this._currentStepIndex);
  }

  isStepValid(stepIndex: number): boolean {
    if (!this._formBuilder.form || stepIndex < 0 || stepIndex >= this._steps.length) return false;
    const step = this._steps[stepIndex];
    return step.fields.every(field => {
      const ctrl = this._formBuilder.form.get(field);
      return ctrl ? ctrl.valid : true;
    });
  }

  markCurrentStepAsTouched(): void {
    if (this._steps.length === 0) return;
    const step = this.currentStep;
    step.fields.forEach(field => {
      const ctrl = this._formBuilder.form.get(field);
      if (ctrl) {
        ctrl.markAsTouched();
        ctrl.markAsDirty();
      }
    });
  }

  canProceed(): boolean {
    return this.isCurrentStepValid();
  }

  next(): boolean {
    if (!this.canProceed() || this.isLastStep) return false;
    const from = this._currentStepIndex;
    this._currentStepIndex++;
    this._stepChange$.next({ from, to: this._currentStepIndex });
    return true;
  }

  back(): boolean {
    if (this.isFirstStep) return false;
    const from = this._currentStepIndex;
    this._currentStepIndex--;
    this._stepChange$.next({ from, to: this._currentStepIndex });
    return true;
  }

  goToStep(index: number): boolean {
    if (index < 0 || index >= this._steps.length) return false;
    for (let i = 0; i < index; i++) {
      if (!this.isStepValid(i)) return false;
    }
    const from = this._currentStepIndex;
    this._currentStepIndex = index;
    this._stepChange$.next({ from, to: index });
    return true;
  }

  reset(): void {
    this._currentStepIndex = 0;
    this._formBuilder.resetForm();
  }

  getStepFields(stepIndex: number): AbstractControl[] {
    if (stepIndex < 0 || stepIndex >= this._steps.length) return [];
    return this._steps[stepIndex].fields
      .map(f => this._formBuilder.form.get(f))
      .filter((c): c is AbstractControl => c != null);
  }

  get value(): T {
    return this._formBuilder.form.getRawValue() as T;
  }

  get completedSteps(): number[] {
    return this._steps
      .filter((_, i) => i < this._currentStepIndex && this.isStepValid(i))
      .map(s => s.index);
  }

  // ── Typed field helpers (IntelliSense) ──────────────────────

  /**
   * Get a control using a typed selector.
   * @example wizard.getControl(a => a.email)
   */
  getControl(selector: ((model: T) => any) | string): AbstractControl | null {
    const name = typeof selector === 'string' ? selector : this.extractFieldName(selector);
    return this._formBuilder.form.get(name);
  }

  /**
   * Set a single field value using a typed selector.
   * @example wizard.setFieldValue(a => a.email, 'test@example.com')
   */
  setFieldValue(selector: ((model: T) => any) | string, value: any): void {
    const ctrl = this.getControl(selector);
    if (ctrl) ctrl.setValue(value);
  }

  /**
   * Get valueChanges Observable for a single field.
   * @example wizard.watchField(a => a.email).subscribe(v => ...)
   */
  watchField(selector: ((model: T) => any) | string): Observable<any> {
    const ctrl = this.getControl(selector);
    if (!ctrl) throw new Error('Control not found');
    return ctrl.valueChanges;
  }

  // ── Step errors ─────────────────────────────────────────────

  /**
   * Get structured errors for all fields in a step.
   * @example wizard.getStepErrors(1)
   * // [{ field: 'email', errors: { required: true } }, ...]
   */
  getStepErrors(stepIndex: number): { field: string; errors: { [key: string]: any } }[] {
    const step = this._steps.find(s => s.index === stepIndex);
    if (!step || !this._formBuilder.form) return [];
    const result: { field: string; errors: { [key: string]: any } }[] = [];
    step.fields.forEach(field => {
      const ctrl = this._formBuilder.form.get(field);
      if (ctrl && ctrl.errors) {
        result.push({ field, errors: ctrl.errors });
      }
    });
    // Include custom controls from step group if built
    const group = this._stepGroups.get(stepIndex);
    if (group) {
      Object.keys(group.controls).forEach(key => {
        if (!step.fields.includes(key)) {
          const ctrl = group.get(key);
          if (ctrl && ctrl.errors) {
            result.push({ field: key, errors: ctrl.errors });
          }
        }
      });
    }
    return result;
  }

  // ── Step change observable ──────────────────────────────────

  /**
   * Observable that emits { from, to } on every step transition.
   * @example wizard.onStepChange.subscribe(e => console.log(e.from, '=>', e.to))
   */
  get onStepChange(): Observable<{ from: number; to: number }> {
    return this._stepChange$.asObservable();
  }

  dispose(): void {
    this._stepChange$.complete();
  }
}
`;
    }
}
