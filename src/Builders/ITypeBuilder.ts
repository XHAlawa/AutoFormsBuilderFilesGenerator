import { IBuildServices } from "../interfaces/ICurrentProp";
import { SchemaObject } from "../interfaces/schemaObject";

export interface ITypeBuilder { 
    build(propName:string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices);
}