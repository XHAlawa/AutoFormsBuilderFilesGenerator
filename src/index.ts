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

        startup.ReadConfigurationFile();

        startup.checkOutPutDir()

        if (!helpers.isNullOrEmpty(startup.parsedConfig.schemeFile)) {
            startup.ProccessFile();
        } else if (!helpers.isNullOrEmpty(startup.parsedConfig.schemeFile)) {
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

    private static ReadConfigurationFile() {
        console.log(`\n\nLoading \n`);
        console.log('Welcome in form auto builder\n');

        let mainDir = process.cwd();
        let configFileName = process.argv[2] ?? (mainDir + '\\swagger.json');
        console.log("Swagger Config : " + configFileName + "\n");

        if (!fs.existsSync(configFileName)) {
            console.log("File Not Exist");
            process.exit(1);
        }

        startup.parsedConfig = JSON.parse(fs.readFileSync(configFileName, 'utf-8')) as IParsedConfig;

        if (helpers.isNullOrEmpty(startup.parsedConfig.schemeFile) && helpers.isNullOrEmpty(startup.parsedConfig.input)) {
            console.log("Scheme Not Found, Please put url In 'input' property Or put file path in 'schemeFile' property");
            process.exit(1);
        }

        if (!/[a-zA-Z]\:/.test(startup.parsedConfig.formsOutput))
            startup.parsedConfig.formsOutput = mainDir + path.resolve(startup.parsedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
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
            new templateGenerator().buildForm(JSON.parse(text), startup.parsedConfig);
        }catch (e) {
            console.error(e);
        }
    }
}

startup.main();