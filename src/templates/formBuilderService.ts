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
}