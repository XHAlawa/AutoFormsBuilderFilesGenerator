#!node

import templateGenerator from './templateGenerator';
import * as fs from 'fs';
import path from 'path';
import * as http from 'http';
import * as https from 'https';
import { IParsedConfig } from './interfaces/IParsedConfig';

class startup {
    public static parsedConfig = null as any as IParsedConfig;
    public static main(): number {

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
        if (startup.parsedConfig.input === null || startup.parsedConfig.input === '') {
            console.log("Url Not Found");
            process.exit(1);
        }

        startup.parsedConfig.formsOutput = mainDir + path.resolve(startup.parsedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
        console.log(`\nReading JSON from ${startup.parsedConfig.input}`);
        if ((startup.parsedConfig.input as string).startsWith("https"))
        {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            https.get(startup.parsedConfig.input, (res) => startup.handleResponse(res))
        }
        else
            http.get(startup.parsedConfig.input, res => startup.handleResponse(res));

        return 0;
    }

    private static handleResponse(res) {
        let chunk = '';
        res.on('data', (b) => chunk += b);
        res.on('end', () => {

            if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                fs.mkdirSync(startup.parsedConfig.formsOutput);
                if (!fs.existsSync(startup.parsedConfig.formsOutput)) {
                    console.log("\n Error While creating target folder: " + startup.parsedConfig.formsOutput);
                    return;
                }
            } else {
                //fs.rmdirSync(paresedConfig.formsOutput);
                //fs.mkdirSync(paresedConfig.formsOutput);
            }

            let body = JSON.parse(chunk);
            new templateGenerator(startup.parsedConfig).buildForm(body);
        });
    }
}

startup.main();