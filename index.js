#! /usr/bin/env node

import templateGenerator from './templateGenerator.js';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as http from 'http'

process.stdout.write(`\n\nLoading \n`);
process.stdout.write('Welcome in form auto builder\n');

let mainDir = process.cwd()
let configFileName = process.argv[2] ?? ( mainDir + '\\swagger.json'); 
process.stdout.write("Swagger Config : " + configFileName + "\n");

if (!fs.existsSync(configFileName)) {
    process.stdout.write("File Not Exist");
    process.exit(1);
}

let paresedConfig = JSON.parse(fs.readFileSync(configFileName));
if (paresedConfig.input === null || paresedConfig.input === '') {
    process.stdout.write("Url Not Found");
    process.exit(1);
}

paresedConfig.formsOutput = mainDir + path.resolve(paresedConfig.formsOutput).replace(/[a-zA-Z]\:/g, '');
process.stdout.write(`\nReading JSON from ${paresedConfig.input}`);
http.get(paresedConfig.input, null, (res) => {
    let chunk = '';
    res.on('data', (b) =>  chunk += b );
    res.on('end', () => {

        if (!fs.existsSync(paresedConfig.formsOutput)) {
            fs.mkdirSync(paresedConfig.formsOutput)
            if (!fs.existsSync(paresedConfig.formsOutput)) {
                process.stdout.write("\n Error While creating target folder: " + this.paresedConfig.formsOutput);
                return;
            }
        } else {
            //fs.rmdirSync(this.paresedConfig.formsOutput)
            //fs.mkdirSync(this.paresedConfig.formsOutput);
        }

        let body = JSON.parse(chunk);
        new templateGenerator(paresedConfig).buildForm(body);
    })
})


