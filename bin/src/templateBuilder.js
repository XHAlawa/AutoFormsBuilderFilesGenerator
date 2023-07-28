"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateBuilder = void 0;
var fileImportingManager_1 = __importDefault(require("./fileImportingManager"));
var arrayProperty_1 = __importDefault(require("./arrayProperty"));
var injectServicesManager_1 = __importDefault(require("./injectServicesManager"));
var extraScriptManager_1 = __importDefault(require("./extraScriptManager"));
var formBuilder_1 = require("./templates/formBuilder");
var helpers_1 = require("./helpers");
var templateBuilder = /** @class */ (function () {
    function templateBuilder(parsedConfig) {
        this.parsedConfig = parsedConfig;
        this.arrayControls = "";
        this.props = new extraScriptManager_1.default();
        this.toBeInjected = new Set('');
        this.importsManager = new fileImportingManager_1.default();
    }
    templateBuilder.prototype.build = function (key, properties) {
        var _this = this;
        this.importsManager.import('Injectable', '@angular/core');
        this.importsManager.import('DatePipe', '@angular/common');
        this.importsManager.import('FormArray, FormGroup, FormBuilder, AbstractControl', '@angular/forms');
        this.importsManager.import('IFormBuilder', './IFormBuilder');
        this.importsManager.import(key, this.parsedConfig.modelsPath);
        var services = {
            extraScriptManager: new extraScriptManager_1.default(),
            afterBuildScript: new extraScriptManager_1.default(),
            injectManager: new injectServicesManager_1.default(key),
            importsManager: this.importsManager,
            parsedConfigs: this.parsedConfig
        };
        Object.keys(properties).forEach(function (propertyName) {
            var property = {
                DtoName: key,
                PropertyName: propertyName,
                Property: properties[propertyName],
                Services: services
            };
            if (property.Property.type == 'array')
                arrayProperty_1.default.CreateArrayProp(property);
            _this.props.append("".concat(helpers_1.helpers.tabs).concat(propertyName, ": ").concat(_this.getJsDefaultType(property), ","));
        });
        services.afterBuildScript.append(arrayProperty_1.default.toString());
        return formBuilder_1.formBuilderTemplate.getTemplate(key, this.props.toString(), services);
    };
    templateBuilder.prototype.getJsDefaultType = function (property) {
        var prop = property.Property;
        if (prop.type == 'array')
            return '[]';
        return prop.nullable ? 'null' : ({
            'number': '0',
            'string': "''",
            'boolean': 'false',
            'integer': '0',
        })[prop.type] || undefined;
    };
    return templateBuilder;
}());
exports.templateBuilder = templateBuilder;
//# sourceMappingURL=templateBuilder.js.map