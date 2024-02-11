import { helpers } from "../helpers";

export default class injectServicesManager {
    injectedItems = new Set<string>();
    constructor(private dtoName: string) {
        this.injectedItems = new Set<string>();
    } 

    inject(propertyName: string): boolean {
        if (this.dtoName.toLowerCase() === propertyName.toLowerCase())  // Prevent Circular Dependencies
            return false;   

        this.injectedItems.add(propertyName);
        return true;
    }

    toString(): string {
        let result = '';
        this.injectedItems.forEach(serviceName => {
            let line = `, private ${serviceName}Srvc: ${serviceName}`;
            result += `${line} \n`;
        });
        return result;
    }
}