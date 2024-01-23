"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var templateBuilder_js_1 = require("./templateBuilder.js");
var templateGenerator = /** @class */ (function () {
    function templateGenerator() {
    }
    templateGenerator.prototype.buildForm = function (body, parsedConfig) {
        var components = body.components.schemas;
        Object.keys(components).forEach(function (key) {
            console.log("\n Working On : " + key);
            var builder = new templateBuilder_js_1.templateBuilder(parsedConfig);
            var properties = components[key]['properties'];
            if (properties == null) {
                if (components[key].allOf && components[key].allOf.length == 2) {
                    properties = components[key].allOf[1].properties;
                    var inhertPath = components[key].allOf[0].$ref.replace('#/components/schemas/', '');
                    properties = __assign(__assign({}, properties), components[inhertPath].properties);
                    //check for inherited props
                }
                else {
                    console.log(" .... File Skipped");
                    return; // Skip it
                }
            }
            var frm = builder.build(key, properties);
            fs.writeFileSync(parsedConfig.formsOutput + "/" + key + ".ts", frm);
        });
        fs.writeFileSync(parsedConfig.formsOutput + "/" + "IFormBuilder.ts", "\n            import { FormGroup } from '@angular/forms';\n            export interface IFormBuilder<T> {\n                buildForm(model: T): FormGroup;\n            }\n        ");
    };
    return templateGenerator;
}());
exports.default = templateGenerator;
//# sourceMappingURL=templateGenerator.js.map