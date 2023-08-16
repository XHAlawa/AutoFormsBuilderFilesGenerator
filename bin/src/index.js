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
var startup = /** @class */ (function () {
    function startup() {
    }
    startup.main = function () {
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
        if (startup.parsedConfig.input === null || startup.parsedConfig.input === '') {
            console.log("Url Not Found");
            process.exit(1);
        }
        startup.parsedConfig.formsOutput = mainDir + path_1.default.resolve(startup.parsedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
        console.log("\nReading JSON from ".concat(startup.parsedConfig.input));
        if (startup.parsedConfig.input.startsWith("https")) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            https.get(startup.parsedConfig.input, function (res) { return startup.handleResponse(res); });
        }
        else
            http.get(startup.parsedConfig.input, function (res) { return startup.handleResponse(res); });
        return 0;
    };
    startup.handleResponse = function (res) {
        var chunk = '';
        res.on('data', function (b) { return chunk += b; });
        res.on('end', function () {
            if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                fs.mkdirSync(startup.parsedConfig.formsOutput);
                if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                    console.log("\n Error While creating target folder: " + startup.parsedConfig.formsOutput);
                    return;
                }
            }
            else {
                //fs.rmdirSync(paresedConfig.formsOutput);
                //fs.mkdirSync(paresedConfig.formsOutput);
            }
            var body = JSON.parse(chunk);
            new templateGenerator_1.default(startup.parsedConfig).buildForm(body);
        });
    };
    startup.parsedConfig = null;
    return startup;
}());
startup.main();
//# sourceMappingURL=index.js.map