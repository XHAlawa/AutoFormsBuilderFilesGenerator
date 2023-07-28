"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propFunctionsTemplate = void 0;
var propFunctionsTemplate = /** @class */ (function () {
    function propFunctionsTemplate() {
    }
    propFunctionsTemplate.getTemplate = function (propName) {
        return "\n    get ".concat(propName, "Ctrl(): FormControl {\n      return this.form.get('").concat(propName, "') as FormControl;\n    }\n\n    get ").concat(propName, "ValueChanges$() {\n      return this.").concat(propName, "Ctrl?.valueChanges;\n    }\n        ");
    };
    return propFunctionsTemplate;
}());
exports.propFunctionsTemplate = propFunctionsTemplate;
//# sourceMappingURL=propsFunctions.js.map