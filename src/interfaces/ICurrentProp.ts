import extraScriptManager from "../extraScriptManager";
import fileImportingManager from "../fileImportingManager";
import injectServicesManager from "../injectServicesManager";
import { IParsedConfig } from "./IParsedConfig";

export enum IDataType {
    integer = 'integer',
    string = 'string',
    boolean = 'boolean',
    number = 'number',
    array = 'array'
}

export interface IBuildServices {
    injectManager: injectServicesManager;
    extraScriptManager: extraScriptManager;
    afterBuildScript: extraScriptManager;
    importsManager: fileImportingManager;
    parsedConfigs: IParsedConfig
}

export interface ICurrentProp {
    DtoName: string;
    PropertyName: string;
    Services: IBuildServices,
    Property: {
        type: IDataType,
        nullable?: boolean,
        format?: string,
        $ref?: string,
        items?: { // Incase Of Arrays
            $ref: string
        }
    }
}