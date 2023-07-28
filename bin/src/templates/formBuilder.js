"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formBuilderTemplate = void 0;
var helpers_1 = require("../helpers");
var formBuilderTemplate = /** @class */ (function () {
    function formBuilderTemplate() {
    }
    formBuilderTemplate.getTemplate = function (key, props, services) {
        return "\n".concat(services.importsManager.toString(), "\n@Injectable({ providedIn: 'root' })\nexport class ").concat(helpers_1.helpers.normalizeToFormBuilderName(key), " implements IFormBuilder<").concat(key, "> {\n    DatePipe: DatePipe = null as any;\n    DateFormat: string = 'yyyy-MM-dd';\n    form: FormGroup = null as any;\n\n    constructor(private fb: FormBuilder\n        ").concat(services.injectManager.toString(), "\n    ) {\n        this.DatePipe = new DatePipe('en-US');\n    }\n\n    updateCulture(culture: string = 'en-US') {\n        this.DatePipe = new DatePipe(culture);\n    }\n\n    resetForm() {\n        this.form.reset();\n    }\n\n    buildForm(model: ").concat(key, " | null = null) {\n       this.form = this.fb.group<").concat(key, ">({\n            ").concat(props, "\n       });\n       if (model != null) {\n            this.form.patchValue({ ... model });\n       }\n       ").concat(services.afterBuildScript.toString(), "\n\n       return this.form;\n    }\n    ").concat(services.extraScriptManager.toString(), "\n}\n                ");
    };
    return formBuilderTemplate;
}());
exports.formBuilderTemplate = formBuilderTemplate;
//# sourceMappingURL=formBuilder.js.map