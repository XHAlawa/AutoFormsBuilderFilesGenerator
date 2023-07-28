#!/usr/bin/env node

import templateGenerator from './templateGenerator';
import * as fs from 'fs';
import path from 'path';
import * as http from 'http';

class startup {
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

        let paresedConfig = JSON.parse(fs.readFileSync(configFileName, 'utf-8'));
        if (paresedConfig.input === null || paresedConfig.input === '') {
            console.log("Url Not Found");
            process.exit(1);
        }

        paresedConfig.formsOutput = mainDir + path.resolve(paresedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
        console.log(`\nReading JSON from ${paresedConfig.input}`);
        http.get(paresedConfig.input, null as any, (res) => {
            let chunk = '';
            res.on('data', (b) => chunk += b);
            res.on('end', () => {

                if (!fs.existsSync(paresedConfig.formsOutput)) {
                    fs.mkdirSync(paresedConfig.formsOutput);
                    if (!fs.existsSync(paresedConfig.formsOutput)) {
                        console.log("\n Error While creating target folder: " + paresedConfig.formsOutput);
                        return;
                    }
                } else {
                    //fs.rmdirSync(paresedConfig.formsOutput);
                    //fs.mkdirSync(paresedConfig.formsOutput);
                }

                let body = JSON.parse(chunk);
                new templateGenerator(paresedConfig).buildForm(body);
            });
        });

        return 0;
    }
}

startup.main();