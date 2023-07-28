"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extraScriptManager = /** @class */ (function () {
    function extraScriptManager() {
        this.scripts = '';
    }
    extraScriptManager.prototype.append = function (script) {
        this.scripts += "\n ".concat(script);
    };
    extraScriptManager.prototype.toString = function () {
        return this.scripts;
    };
    return extraScriptManager;
}());
exports.default = extraScriptManager;
//# sourceMappingURL=extraScriptManager.js.map