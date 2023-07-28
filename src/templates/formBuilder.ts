import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";

export class formBuilderTemplate {
    static getTemplate(key: string, props: string, services: IBuildServices) {
        return `
${services.importsManager.toString()}
@Injectable({ providedIn: 'root' })
export class ${helpers.normalizeToFormBuilderName(key)} implements IFormBuilder<${key}> {
    DatePipe: DatePipe = null as any;
    DateFormat: string = 'yyyy-MM-dd';
    form: FormGroup = null as any;

    constructor(private fb: FormBuilder
        ${services.injectManager.toString()}
    ) {
        this.DatePipe = new DatePipe('en-US');
    }

    updateCulture(culture: string = 'en-US') {
        this.DatePipe = new DatePipe(culture);
    }

    resetForm() {
        this.form.reset();
    }

    buildForm(model: ${key} | null = null) {
       this.form = this.fb.group<${key}>({
            ${props}
       });
       if (model != null) {
            this.form.patchValue({ ... model });
       }
       ${services.afterBuildScript.toString()}

       return this.form;
    }
    ${services.extraScriptManager.toString()}
}
                `
    }
}