#!node

import templateGenerator from './templateGenerator';
import * as fs from 'fs';
import path from 'path';
import * as http from 'http';
import * as https from 'https';
import { IParsedConfig } from './interfaces/IParsedConfig';
import { helpers } from './helpers';

class startup {
    public static parsedConfig = null as any as IParsedConfig;
    public static main(): number {
        const args = process.argv.slice(2);
        if (args.includes('--help') || args.includes('-h')) {
            console.log('Usage: ng-frmGenerator [init] [swagger.json] [--customize]');
            console.log('  init          : create an initial swagger.json config in the current folder (or a given file name)');
            console.log('  [swagger.json]: configuration file used for generation (default: ./swagger.json)');
            console.log('  --customize   : copy default templates to a local folder and update config');
            return 0;
        }
        const mainDir = process.cwd();

        if (args[0] === 'init') {
            const targetNameArg = args[1] && !args[1].startsWith('-') ? args[1] : 'swagger.json';
            const targetPath = path.isAbsolute(targetNameArg) ? targetNameArg : path.resolve(mainDir, targetNameArg);

            if (fs.existsSync(targetPath)) {
                console.log(`Configuration file already exists: ${targetPath}`);
                return 1;
            }

            const defaultConfig = {
                "$schema": "node_modules/ng-openapi-gen/ng-openapi-gen-schema.json",
                "input": "https://localhost:44325/swagger/v1/swagger.json",
                "output": "./src/app/api",
                "ignoreUnusedModels": false,
                "modelsPath": "./../api/models",
                "formsOutput": "/src/app/forms",
                "schemeFile": "E://swagger.json",
                "useEnumValuesAsString": false,
                "useSignalFormTemplates": false,
                "generateFormsHelpers": true,
                "generateCustomValidators": true,
                "generateValidationManager": true,
                "generateShowForErrorDirective": true,
                "generateIFormBuilder": true,
                "generateDateHelper": true,
                "generateEnumHelper": true,
                "customFormTemplatePath": "",
                "customSignalFormTemplatePath": "",
                "generateValidationUiHelpers": true,
                "cleanupUnusedFiles": true,
                "includeModels": [],
                "excludeModels": [],
                "generateValidationMessagesJson": true
            };

            fs.writeFileSync(targetPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf-8' });
            console.log(`Created initial configuration file at: ${targetPath}`);
            return 0;
        }

        const isCustomize = args.includes('--customize');

        // First non-flag argument is treated as config file path
        const configArg = args.find(a => !a.startsWith('-') && a !== '--customize');
        const configFileName = configArg ?? (mainDir + '\\swagger.json');

        if (isCustomize) {
            startup.WriteCustomizeTemplates(configFileName, mainDir);
            return 0;
        }

        startup.ReadConfigurationFile(configFileName);

        startup.checkOutPutDir()

        if (!helpers.isNullOrEmpty(startup.parsedConfig.schemeFile)) {
            startup.ProccessFile();
        } else if (!helpers.isNullOrEmpty(startup.parsedConfig.input)) {
            startup.ProccessUrl();
        }

        return 0;
    }

    static checkOutPutDir() {
        if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
            fs.mkdirSync(startup.parsedConfig.formsOutput);
            if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                console.log("\n Error While creating output folder: " + startup.parsedConfig.formsOutput);
                return;
            }
        } else {
            //fs.rmdirSync(paresedConfig.formsOutput);
            //fs.mkdirSync(paresedConfig.formsOutput);
        }
    }

    private static ProccessFile() {
        let filePath = startup.parsedConfig.schemeFile;

        if (fs.existsSync(filePath)) {
            let scheme = fs.readFileSync(filePath,{ encoding: 'utf-8' });
            this.proccess(scheme);
        } else {
            console.log("File Not Exist, Pleas Check File Path " +  filePath);
        }
    }

    private static ProccessUrl() {
        console.log(`\nReading JSON from ${startup.parsedConfig.input}`);
        if ((startup.parsedConfig.input as string).startsWith("https")) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            https.get(startup.parsedConfig.input, (res) => startup.handleRequest(res));
        }

        else
            http.get(startup.parsedConfig.input, res => startup.handleRequest(res));
    }

    private static ReadConfigurationFile(configFileName: string) {
        console.log(`\n\nLoading \n`);
        console.log('Welcome in form auto builder\n');

        console.log("Swagger Config : " + configFileName + "\n");

        if (!fs.existsSync(configFileName)) {
            console.log("File Not Exist");
            process.exit(1);
        }

        startup.parsedConfig = JSON.parse(fs.readFileSync(configFileName, 'utf-8')) as IParsedConfig;

        const hasSchemeFile = !helpers.isNullOrEmpty(startup.parsedConfig.schemeFile);
        const hasInput = !helpers.isNullOrEmpty(startup.parsedConfig.input);

        if (!hasSchemeFile && !hasInput) {
            console.log("Scheme Not Found, Please put url In 'input' property Or put file path in 'schemeFile' property");
            process.exit(1);
        }

        if (hasSchemeFile && hasInput) {
            console.log("Configuration Error: 'input' and 'schemeFile' cannot both be set. Please use only one of them.");
            process.exit(1);
        }

        if (!/[a-zA-Z]\:/.test(startup.parsedConfig.formsOutput))
            startup.parsedConfig.formsOutput = path.resolve(startup.parsedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
    }

    private static WriteCustomizeTemplates(configFileName: string, mainDir: string) {
        console.log(`\n\nCustomization mode\n`);
        console.log('Welcome in form auto builder\n');
        console.log("Swagger Config : " + configFileName + "\n");

        if (!fs.existsSync(configFileName)) {
            console.log("File Not Exist");
            process.exit(1);
        }

        const parsedConfig = JSON.parse(fs.readFileSync(configFileName, 'utf-8')) as IParsedConfig;

        const templatesDirName = 'AutoFormsBuilderFilesGeneratorTemplates';
        const templatesDir = path.resolve(mainDir, templatesDirName);

        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }

        // Resolve built-in template module paths (compiled JS at runtime)
        const reactiveSource = require.resolve('./templateBuilder').replace('templateBuilder.js', 'templates/formBuilderService.js');
        const signalSource = require.resolve('./templateBuilder').replace('templateBuilder.js', 'templates/signalFormBuilderService.js');

        const reactiveTargetRel = `./${templatesDirName}/customFormTemplate.js`;
        const signalTargetRel = `./${templatesDirName}/customSignalFormTemplate.js`;

        const reactiveTargetAbs = path.resolve(mainDir, reactiveTargetRel);
        const signalTargetAbs = path.resolve(mainDir, signalTargetRel);

        if (!fs.existsSync(reactiveTargetAbs)) {
            fs.copyFileSync(reactiveSource, reactiveTargetAbs);
        }

        if (!fs.existsSync(signalTargetAbs)) {
            fs.copyFileSync(signalSource, signalTargetAbs);
        }

        parsedConfig.customFormTemplatePath = parsedConfig.customFormTemplatePath || reactiveTargetRel;
        parsedConfig.customSignalFormTemplatePath = parsedConfig.customSignalFormTemplatePath || signalTargetRel;

        fs.writeFileSync(configFileName, JSON.stringify(parsedConfig, null, 4));

        console.log(`Customization templates are ready in folder: ${templatesDirName}`);
        console.log(`customFormTemplatePath: ${parsedConfig.customFormTemplatePath}`);
        console.log(`customSignalFormTemplatePath: ${parsedConfig.customSignalFormTemplatePath}`);
    }

    private static handleRequest(res) {
        let chunk = '';
        res.on('data', (b) => chunk += b);
        res.on('end', () => { 
            this.proccess(chunk);
        });
    }

    private static proccess(text: string) { 
        try{ 
            const parsedScheme = JSON.parse(text) ?? {};
            // Validate For Schema component property
            if (!parsedScheme.components || !parsedScheme.components.schemas) {
                console.log("Schema Not Found, Please put url In 'input' property Or put file path in 'schemeFile' property");
                process.exit(1);
            }

            startup.parsedConfig.rootSchemas  = parsedScheme;
            new templateGenerator().buildForm(startup.parsedConfig);
        }catch (e) {
            console.error(e);
        }
    }
}

startup.main();