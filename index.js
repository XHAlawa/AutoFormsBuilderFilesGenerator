import templateGenerator from './templateGenerator.js';
import * as fs from 'fs';
import * as http from 'http'

process.stdout.write(`\n\nLoading \n`);
process.stdout.write('Welcome in form auto builder\n');

let paresedConfig = JSON.parse(fs.readFileSync('./swagger.json'));
if (paresedConfig.url === null || paresedConfig.url === '') {
    process.stdout.write("Url Not Found");
    process.exit(1);
}
process.stdout.write(`\nReading JSON from ${paresedConfig.url}`);
http.get(paresedConfig.url, null, (res) => {
    let chunk = '';
    res.on('data', (b) =>  chunk += b );
    res.on('end', () => {

        if (!fs.existsSync(paresedConfig.target)) {
            fs.mkdirSync(paresedConfig.target)
            if (!fs.existsSync(paresedConfig.target)) {
                process.stdout.write("\n Error While creating target folder: " + this.paresedConfig.target);
                return;
            }
        } else {
            //fs.rmdirSync(this.paresedConfig.target)
            //fs.mkdirSync(this.paresedConfig.target);
        }

        let body = JSON.parse(chunk);
        new templateGenerator(paresedConfig).buildForm(body);    
    }) 
})
