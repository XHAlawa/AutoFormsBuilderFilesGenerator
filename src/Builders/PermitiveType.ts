import { IBuildServices, IDataType } from "../interfaces/ICurrentProp";
import { ITypeBuilder } from "./ITypeBuilder";
import { helpers } from "../helpers";
import { SchemaObject } from "../interfaces/schemaObject";

export class PermitiveType implements ITypeBuilder {
    build(propName:string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {

        let validations: string[] = [];
        let defaultValue = helpers.getDefaultType(prop.type! as string ,prop.nullable);

        if (component.required?.includes(propName))
            validations.push('Validators.required');

        if (prop.type == IDataType.string) {
            if (prop.minLength) 
                validations.push(`Validators.minLength(${prop.minLength})`)
            if (prop.maxLength)
                validations.push(`Validators.maxLength(${prop.maxLength})`)
        }

        if (prop.type == IDataType.integer || prop.type == IDataType.number) {
            if (prop.minimum) {
                validations.push(`Validators.max(${prop.minimum})`)
                defaultValue = prop.minimum.toString();
            }
            if (prop.maximum)   
                validations.push(`Validators.max(${prop.maximum})`)
        }

        if (prop.format! == "email")
            validations.push(`Validators.email`);

        if (prop.format! == 'guid') 
            validations.push(`guidValidator(${prop.nullable! ? 'true' : ''})`);

        if (prop.format == 'date-time') {
            defaultValue = 'this.DatePipe.transform(new Date(), \'yyyy-MM-dd\') as string' // DatePipe Is Always Defined In Template Constructor;
        }

        buildServices.formGroupProps.append(`${helpers.tabs}${propName}:`);

        if (validations.length > 0)
            buildServices.formGroupProps.append(`[ ${defaultValue} , Validators.compose([ ${ validations.join(', ') } ]) ], \n `);
        else 
            buildServices.formGroupProps.append(`${defaultValue}, \n`);
    }
}