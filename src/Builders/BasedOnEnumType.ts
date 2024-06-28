import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";
import { ReferenceObject, SchemaObject } from "../interfaces/schemaObject";
import { ITypeBuilder } from "./ITypeBuilder";

export class BasedOnEnumType implements ITypeBuilder {
    build(propName: string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
        const castedProp = prop as any as ReferenceObject;
        
        const targetModelName = castedProp.$ref.replace(helpers.componentsPath, '');
        const targetModel = buildServices.components[targetModelName] as SchemaObject;
        if (prop.nullable! || targetModel.enum == null || targetModel.enum!.length == 0) {
            buildServices.formGroupProps.append(`${helpers.tabs}${propName}: [ null ], \n`);
        } else {
            const firstEnumValue =  targetModel.enum![0];
            const tabs = `\n${helpers.tabs}${helpers.tabs1}`
            let arrayFormater = `${tabs}`;
            let counter = 0;
            targetModel.enum!.forEach(e => {
                if (counter == 10) {
                    arrayFormater += tabs;
                    counter = -1;
                }
                counter ++;

                arrayFormater += `${e}, `;
            });

            buildServices.formGroupProps.append(`${helpers.tabs}${propName}: [ ${ firstEnumValue }, Validators.compose([ oneOfValidator( [ ${ arrayFormater } ] ) ] )],`);

            // Append reference comment
            //buildServices.formGroupProps.append(` // All Possible Values Are Retrived From ${ targetModelName } \n`)
        }
    }

}