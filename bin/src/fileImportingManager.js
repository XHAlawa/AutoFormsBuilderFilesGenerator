"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileImportingManager = /** @class */ (function () {
    function FileImportingManager() {
        this.importedItems = [];
    }
    FileImportingManager.prototype.createInstance = function (fileName, path) {
        return {
            path: path,
            files: [fileName],
        };
    };
    FileImportingManager.prototype.import = function (fileName, path) {
        var existPath = this.importedItems.find(function (x) { return x.path === path; });
        if (existPath) {
            if (existPath.files.findIndex(function (x) { return x.toLowerCase() == fileName.toLowerCase(); }) > -1) {
                return;
            }
            existPath.files.push(fileName);
            return;
        }
        this.importedItems.push(this.createInstance(fileName, path));
    };
    FileImportingManager.prototype.toString = function () {
        var result = "";
        this.importedItems.forEach(function (x) {
            var line = "import {";
            x.files.forEach(function (f) {
                line += "".concat(f, ", ");
            });
            line = line.substring(0, line.length - 2); // Remove Last Comma
            line += "} from '".concat(x.path, "';");
            result += "".concat(line, " \n");
        });
        return result;
    };
    return FileImportingManager;
}());
exports.default = FileImportingManager;
//# sourceMappingURL=fileImportingManager.js.map