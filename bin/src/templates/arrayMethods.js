"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayMethodsTemplate = void 0;
var arrayMethodsTemplate = /** @class */ (function () {
    function arrayMethodsTemplate() {
    }
    arrayMethodsTemplate.getTemplate = function (property, caller, arrayRef) {
        return "\n    ".concat(property.PropertyName, "Array(): FormArray {\n        return this.form.controls['").concat(property.PropertyName, "'] as FormArray;\n    }\n    ").concat(property.PropertyName, "Controls(): AbstractControl<any, any>[] {\n        return this.").concat(property.PropertyName, "Array().controls;  \n    }\n    delete").concat(property.PropertyName, "ByIndex(index: number): void {\n        this.").concat(property.PropertyName, "Array().removeAt(index);\n    }\n    addNew").concat(property.PropertyName, "(model: ").concat(arrayRef, " | null = null): FormGroup<any> {\n        let frm = ").concat(caller, ".buildForm(model);\n        this.").concat(property.PropertyName, "Array().push(frm);\n        return frm;\n    }\n    ");
    };
    return arrayMethodsTemplate;
}());
exports.arrayMethodsTemplate = arrayMethodsTemplate;
//# sourceMappingURL=arrayMethods.js.map