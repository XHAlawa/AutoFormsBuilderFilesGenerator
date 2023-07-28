"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var injectServicesManager = /** @class */ (function () {
    function injectServicesManager(dtoName) {
        this.dtoName = dtoName;
        this.injectedItems = new Set();
        this.injectedItems = new Set();
    }
    injectServicesManager.prototype.inject = function (propertyName) {
        if (this.dtoName.toLowerCase() === propertyName.toLowerCase()) // Prevent Circular Dependencies
            return false;
        this.injectedItems.add(propertyName);
        return true;
    };
    injectServicesManager.prototype.toString = function () {
        var result = '';
        this.injectedItems.forEach(function (serviceName) {
            var line = ", private ".concat(serviceName, "Srvc: ").concat(serviceName);
            result += "".concat(line, " \n");
        });
        return result;
    };
    return injectServicesManager;
}());
exports.default = injectServicesManager;
//# sourceMappingURL=injectServicesManager.js.map