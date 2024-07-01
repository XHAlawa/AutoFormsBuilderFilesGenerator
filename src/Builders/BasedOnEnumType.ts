import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";
import { ReferenceObject, SchemaObject } from "../interfaces/schemaObject";
import { ITypeBuilder } from "./ITypeBuilder";

export class BasedOnEnumType implements ITypeBuilder {

    enumTypeImported = false;
    build(propName: string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
        this.enumTypeImported = false;
        const castedProp = prop as any as ReferenceObject;
        
        const targetModelName = castedProp.$ref.replace(helpers.componentsPath, '');
        const targetModel = buildServices.components[targetModelName] as SchemaObject;
        const splitedPath = targetModelName.split('/');
        const enumName = splitedPath[splitedPath.length - 1];

        if (prop.nullable! || targetModel.enum == null || targetModel.enum!.length == 0) {
            buildServices.formGroupProps.append(`${helpers.tabs}${propName}: [ null ], \n`);
        } else {

            if (buildServices.parsedConfigs.useEnumValuesAsString) {
                
            }

            const firstEnumValue = this.getValueOfEnum(targetModel.enum[0], enumName, buildServices);
            const tabs = `\n${helpers.tabs}${helpers.tabs1}`
            let arrayFormater = `${tabs}`;
            let counter = 0;
            targetModel.enum!.forEach(e => {
                if (counter == 10) {
                    arrayFormater += tabs;
                    counter = -1;
                }
                counter ++;

                arrayFormater += `${this.getValueOfEnum(e, enumName, buildServices)}, `;
            });

            buildServices.formGroupProps.append(`${helpers.tabs}${propName}: [ ${ firstEnumValue }, Validators.compose([ oneOfValidator( [ ${ arrayFormater } ] ) ] )],\n`);

            
        }
    }

    private getValueOfEnum(value: any, enumName: string, buildServices: IBuildServices) {
        let pasredIntNumber = parseInt(value);
        if (!isNaN(pasredIntNumber)) return pasredIntNumber;

        else if (buildServices.parsedConfigs.useEnumValuesAsString ?? false) {
            return `'${value}'`;
        } else {
            if (!this.enumTypeImported) {
                this.enumTypeImported = true;
                buildServices.importsManager.import(enumName,buildServices.parsedConfigs.modelsPath);
            }
            return `${enumName}.${value}`;
        }
    }

}