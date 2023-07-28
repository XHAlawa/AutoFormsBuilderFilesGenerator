export default class FileImportingManager {
    importedItems: { path: string, files: string[] }[];
    
    constructor() {
        this.importedItems = [];
    }

    private createInstance(fileName: string, path: string) {
        return { 
            path,
            files: [ fileName ],
        }
    }

    import(fileName: string, path: string) {
        let existPath = this.importedItems.find(x => x.path === path);
        if (existPath) {
            if (existPath.files.findIndex(x => x.toLowerCase() == fileName.toLowerCase()) > -1) {
                return;
            }
            existPath.files.push(fileName);
            return;
        }

        this.importedItems.push(this.createInstance(fileName, path));
    }

    toString() {
        let result = ``;
        this.importedItems.forEach(x => {
            let line = `import {`;
            x.files.forEach(f => {
                line += `${f}, `;
            });
            line = line.substring(0, line.length - 2); // Remove Last Comma
            line += `} from '${x.path}';`;
            result += `${line} \n`;
        });
        return result;
    }
}