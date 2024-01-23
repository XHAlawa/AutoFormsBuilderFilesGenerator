#!node
"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var templateGenerator_1 = __importDefault(require("./templateGenerator"));
var fs = __importStar(require("fs"));
var path_1 = __importDefault(require("path"));
var http = __importStar(require("http"));
var https = __importStar(require("https"));
var helpers_1 = require("./helpers");
var startup = /** @class */ (function () {
    function startup() {
    }
    startup.main = function () {
        startup.ReadConfigurationFile();
        startup.checkOutPutDir();
        if (!helpers_1.helpers.isNullOrEmpty(startup.parsedConfig.schemeFile)) {
            startup.ProccessFile();
        }
        else if (!helpers_1.helpers.isNullOrEmpty(startup.parsedConfig.schemeFile)) {
            startup.ProccessUrl();
        }
        return 0;
    };
    startup.checkOutPutDir = function () {
        if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
            fs.mkdirSync(startup.parsedConfig.formsOutput);
            if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                console.log("\n Error While creating output folder: " + startup.parsedConfig.formsOutput);
                return;
            }
        }
        else {
            //fs.rmdirSync(paresedConfig.formsOutput);
            //fs.mkdirSync(paresedConfig.formsOutput);
        }
    };
    startup.ProccessFile = function () {
        var filePath = startup.parsedConfig.schemeFile;
        if (fs.existsSync(filePath)) {
            var scheme = fs.readFileSync(filePath, { encoding: 'utf-8' });
            this.proccess(scheme);
        }
        else {
            console.log("File Not Exist, Pleas Check File Path " + filePath);
        }
    };
    startup.ProccessUrl = function () {
        console.log("\nReading JSON from ".concat(startup.parsedConfig.input));
        if (startup.parsedConfig.input.startsWith("https")) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            https.get(startup.parsedConfig.input, function (res) { return startup.handleRequest(res); });
        }
        else
            http.get(startup.parsedConfig.input, function (res) { return startup.handleRequest(res); });
    };
    startup.ReadConfigurationFile = function () {
        var _a;
        console.log("\n\nLoading \n");
        console.log('Welcome in form auto builder\n');
        var mainDir = process.cwd();
        var configFileName = (_a = process.argv[2]) !== null && _a !== void 0 ? _a : (mainDir + '\\swagger.json');
        console.log("Swagger Config : " + configFileName + "\n");
        if (!fs.existsSync(configFileName)) {
            console.log("File Not Exist");
            process.exit(1);
        }
        startup.parsedConfig = JSON.parse(fs.readFileSync(configFileName, 'utf-8'));
        if (helpers_1.helpers.isNullOrEmpty(startup.parsedConfig.schemeFile) && helpers_1.helpers.isNullOrEmpty(startup.parsedConfig.input)) {
            console.log("Scheme Not Found, Please put url In 'input' property Or put file path in 'schemeFile' property");
            process.exit(1);
        }
        if (!/[a-zA-Z]\:/.test(startup.parsedConfig.formsOutput))
            startup.parsedConfig.formsOutput = mainDir + path_1.default.resolve(startup.parsedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
    };
    startup.handleRequest = function (res) {
        var _this = this;
        var chunk = '';
        res.on('data', function (b) { return chunk += b; });
        res.on('end', function () {
            _this.proccess(chunk);
        });
    };
    startup.proccess = function (text) {
        try {
            new templateGenerator_1.default().buildForm(JSON.parse(text), startup.parsedConfig);
        }
        catch (e) {
            console.error(e);
        }
    };
    startup.parsedConfig = null;
    return startup;
}());
startup.main();
//# sourceMappingURL=index.js.map