import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";

export class formBuilderTemplate {
    static getTemplate(key: string, services: IBuildServices) {
        return `
${services.importsManager.toString()}

@Injectable()
export class ${helpers.normalizeToFormBuilderName(key)} implements IFormBuilder<${key}> {
    DatePipe: DatePipe = null as any;
    DateFormat: string = 'yyyy-MM-dd';
    form: FormGroup = null as any;

    constructor(private fb: FormBuilder
        ${services.injectManager.toString()}
    ) {
      if (isDevMode()) {
        console.warn('Make Sure ${key} Is Regestered In Component Providers');
      }
      this.DatePipe = new DatePipe('en-US');
    }

    updateCulture(culture: string = 'en-US') {
        this.DatePipe = new DatePipe(culture);
    } 

    static Providers(): any[] {
        return [ ${services.serviceProviders.toString()} ] as any[];
    }

    buildForm(model: ${key} | null = null, 
        additionalControl: { name: string, control?: AbstractControl}[] = []) {
        
        this.form = this.fb.group({
${services.formGroupProps.toString()}
        });

        if (model != null) {
            this.form.patchValue({ ... model });
${services.patchModelScripts.toString()}
        }

        additionalControl.forEach(a => {
          this.form.addControl(a.name, a.control ?? new FormControl())
        })

        ${services.afterBuildScript.toString()}

        return this.form;
    }

    resetForm() {
        this.form.reset();
    }

    getCtrl(controlName: keyof ${key}) {
        return this.form.get(controlName)
    }

    get value() {
        return this.form.getRawValue() as ${key};
    }

    isValid(controlName: keyof ${key}) {
        let ctrl = this.getCtrl(controlName);
        if (ctrl == null) throw 'Control Not Found' + controlName;
        return ctrl.invalid && (ctrl.dirty || ctrl.touched);
    }

    /**
     * Get a control using a typed selector for IntelliSense.
     * @example this.getControl(a => a.email)
     */
    getControl(selector: (model: ${key}) => any): AbstractControl | null {
        const name = this._extractFieldName(selector);
        return this.form.get(name);
    }

    /**
     * Set a single field value using a typed selector.
     * @example this.setFieldValue(a => a.email, 'test@example.com')
     */
    setFieldValue(selector: (model: ${key}) => any, value: any): void {
        const ctrl = this.getControl(selector);
        if (ctrl) ctrl.setValue(value);
    }

    /**
     * Get valueChanges Observable for a single field using a typed selector.
     * @example this.watchField(a => a.email).subscribe(v => ...)
     */
    watchField(selector: (model: ${key}) => any): Observable<any> {
        const ctrl = this.getControl(selector);
        if (!ctrl) throw new Error('Control not found');
        return ctrl.valueChanges;
    }

    private _extractFieldName(fn: (model: ${key}) => any): string {
        let captured = '';
        const proxy = new Proxy({} as any, {
            get(_: any, prop: string) { captured = prop; return undefined; }
        });
        fn(proxy);
        return captured;
    }

    // ── Submit / Loading state ──────────────────────────────────

    private _isSubmitting = false;
    get isSubmitting(): boolean { return this._isSubmitting; }

    /**
     * Validates the form, marks all touched if invalid, then calls saveFn.
     * Manages isSubmitting state automatically.
     * @example this.submit(val => this.http.post('/api/users', val))
     */
    submit<R>(saveFn: (value: ${key}) => Observable<R>): Observable<R> {
        if (this.form.invalid) {
            this.markAllTouched();
            return new Observable(obs => obs.complete());
        }
        this._isSubmitting = true;
        return new Observable<R>(observer => {
            const sub = saveFn(this.value).subscribe({
                next: v => observer.next(v),
                error: e => { this._isSubmitting = false; observer.error(e); },
                complete: () => { this._isSubmitting = false; observer.complete(); }
            });
            return () => { sub.unsubscribe(); this._isSubmitting = false; };
        });
    }

    // ── Bulk operations ─────────────────────────────────────────

    markAllTouched(): void {
        Object.values(this.form.controls).forEach(ctrl => {
            ctrl.markAsTouched();
            ctrl.markAsDirty();
        });
    }

    disableAll(): void {
        Object.values(this.form.controls).forEach(ctrl => ctrl.disable());
    }

    enableAll(): void {
        Object.values(this.form.controls).forEach(ctrl => ctrl.enable());
    }

    // ── Clone ───────────────────────────────────────────────────

    clone(): FormGroup {
        return this.buildForm(this.value);
    }

    // ── Persistence ─────────────────────────────────────────────

    persistTo(storageKey: string, storage: Storage = localStorage): void {
        storage.setItem(storageKey, JSON.stringify(this.value));
    }

    restoreFrom(storageKey: string, storage: Storage = localStorage): boolean {
        const data = storage.getItem(storageKey);
        if (!data) return false;
        try {
            const parsed = JSON.parse(data) as ${key};
            this.form.patchValue(parsed as any);
            return true;
        } catch { return false; }
    }

    clearPersisted(storageKey: string, storage: Storage = localStorage): void {
        storage.removeItem(storageKey);
    }

${services.serviceScripts.toString()}
}
`
    }

    static getProvidersTemplate(key, currentComponentKey) {
        const normalizedKey = helpers.normalizeToFormBuilderName(key);

        if (helpers.normalizeToFormBuilderName(key) == helpers.normalizeToFormBuilderName(currentComponentKey))
            return `${normalizedKey},`;
        return `${normalizedKey}, ...${normalizedKey}.Providers(), `;
    }

    static getDirectProviderTemplate(key) {
        return `${helpers.normalizeToFormBuilderName(key)}, `;
    }
}