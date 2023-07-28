"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arrayMethods_1 = require("./templates/arrayMethods");
var helpers_js_1 = require("./helpers.js");
var arrayGenerator = /** @class */ (function () {
    function arrayGenerator() {
    }
    arrayGenerator.CreateArrayProp = function (property) {
        var _a, _b;
        var propInfo = property.Property;
        arrayGenerator.propsAsArrays.add(property.PropertyName);
        //Normal Array
        if (propInfo.items == null || propInfo.items.$ref == null)
            return;
        var ref = this.replacePath((_b = (_a = propInfo.items) === null || _a === void 0 ? void 0 : _a.$ref) !== null && _b !== void 0 ? _b : '');
        var refNormalizedName = helpers_js_1.helpers.normalizeToFormBuilderName(ref);
        var selfCall = ref.toLowerCase() === property.DtoName.toLowerCase();
        // methods call throw ?
        var caller = 'this';
        if (!selfCall) {
            property.Services.injectManager.inject(refNormalizedName);
            caller = "this.".concat(refNormalizedName, "Srvc");
        }
        property.Services.importsManager.import(ref, property.Services.parsedConfigs.modelsPath);
        if (ref.toLowerCase() != property.DtoName.toLowerCase())
            property.Services.importsManager.import(refNormalizedName, "./" + ref);
        // build array methods
        property.Services.extraScriptManager.append(arrayMethods_1.arrayMethodsTemplate.getTemplate(property, caller, ref));
    };
    arrayGenerator.replacePath = function (path) {
        var paths = path.split('/');
        return helpers_js_1.helpers.capitalizeFirstLetter(paths[paths.length - 1]);
    };
    arrayGenerator.toString = function () {
        if (arrayGenerator.propsAsArrays.size == 0) {
            return '';
        }
        var script = "".concat(helpers_js_1.helpers.tabs2, "["), counter = 0;
        arrayGenerator.propsAsArrays.forEach(function (p) {
            script += "'".concat(p, "',");
            script += (counter > 3) ? '\n' : '';
            counter = counter > 3 ? -1 : counter;
            counter++;
        });
        arrayGenerator.propsAsArrays.clear();
        script += "].forEach(arr => this.form.setControl(arr, this.fb.array([]) ))";
        return script;
    };
    arrayGenerator.propsAsArrays = new Set();
    return arrayGenerator;
}());
exports.default = arrayGenerator;
//# sourceMappingURL=arrayProperty.js.map