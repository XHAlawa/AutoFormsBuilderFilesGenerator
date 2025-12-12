import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";

export class signalFormBuilderTemplate {
    static getTemplate(key: string, services: IBuildServices) {
        return `
${services.importsManager.toString()}

@Injectable()
export class ${helpers.normalizeToFormBuilderName(key)} implements IFormBuilder<${key}> {
    DatePipe: DatePipe = null as any;
    DateFormat: string = 'yyyy-MM-dd';
    form: FormGroup = null as any;
    formValueSignal = signal<${key} | null>(null);
    isValidSignal = computed(() => this.form ? this.form.valid : false);

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

        // Sync reactive form state with signals
        this.formValueSignal.set(this.form.getRawValue() as ${key});
        this.form.valueChanges.subscribe(v => {
          this.formValueSignal.set(v as ${key});
        });

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
    
${services.serviceScripts.toString()}
}
`;
    }
}
