import { IBuildServices } from "../interfaces/ICurrentProp";
import { SchemaObject } from "../interfaces/schemaObject";
import { propFunctionsTemplate } from "../templates/propsFunctions";
import { ITypeBuilder } from "./ITypeBuilder";

export class PropertAccessory implements ITypeBuilder {
    build(propName: string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
        buildServices.serviceScripts.append(propFunctionsTemplate.getTemplate(propName));
    }

}