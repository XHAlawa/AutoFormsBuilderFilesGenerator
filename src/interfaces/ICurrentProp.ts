import scriptManager from "../scriptManager/scriptManager";
import fileImportingManager from "../scriptManager/fileImportingManager";
import injectServicesManager from "../scriptManager/injectServicesManager";
import { IParsedConfig } from "./IParsedConfig";

export enum IDataType {
    integer = 'integer',
    number = 'number',
    string = 'string',
    boolean = 'boolean',
    object = 'object', 
    null = 'null',
    array = 'array',
}
export interface IBuildServices {
    injectManager: injectServicesManager;
    formGroupProps: scriptManager;
    serviceScripts: scriptManager;
    serviceProviders: scriptManager;
    afterBuildScript: scriptManager;
    importsManager: fileImportingManager;
    parsedConfigs: IParsedConfig;
    components: any;
}