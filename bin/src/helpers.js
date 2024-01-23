"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpers = void 0;
var helpers = /** @class */ (function () {
    function helpers() {
    }
    helpers.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    helpers.normalizeToFormBuilderName = function (name) {
        return helpers.capitalizeFirstLetter(name) + 'FormBuilder';
    };
    helpers.isNullOrEmpty = function (text) {
        return text == null || text.toString().trim() == '';
    };
    helpers.tabs2 = "\t\t";
    helpers.tabs = "\t\t\t";
    return helpers;
}());
exports.helpers = helpers;
//# sourceMappingURL=helpers.js.map