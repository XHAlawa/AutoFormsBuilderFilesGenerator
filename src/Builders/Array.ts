import { helpers } from '../helpers';
import { IBuildServices, IDataType } from '../interfaces/ICurrentProp';
import { ReferenceObject, SchemaObject } from '../interfaces/schemaObject';
import { arrayMethodsTemplate } from '../templates/arrayMethods';
import { enumTemplate } from '../templates/enumHelper';
import { BasedOnEnumType } from './BasedOnEnumType';
import { childFormBuilderReference } from './childFormBuilderReference';
import { ITypeBuilder } from './ITypeBuilder';
export class ArrayType implements ITypeBuilder{
    build(propName:string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
    
        let defaultValue: string | null | undefined = '';
        const items = (prop.items ?? {}) as SchemaObject;

        if (prop.nullable!) {
            defaultValue = 'null';
        }
        // Check For Items Type 
        else if ((items as ReferenceObject).$ref) {
            let castedItems = (items as ReferenceObject).$ref;
            let targetModelName = castedItems.replace(helpers.componentsPath, ''  );
            // Check If Target Is Enum 
            if (!buildServices.components[targetModelName].enum)  {

                const reference = childFormBuilderReference.resolve(targetModelName, buildServices.currentModelName, buildServices);
                buildServices.importsManager.import(helpers.capitalizeFirstLetter(targetModelName), buildServices.parsedConfigs.modelsPath);
                buildServices.serviceScripts.append(arrayMethodsTemplate.getTemplate(propName, helpers.capitalizeFirstLetter(targetModelName), childFormBuilderReference.getGetterTemplate(reference)));
                buildServices.patchModelScripts.append(arrayMethodsTemplate.getPatchTemplate(propName));
                defaultValue = ``
            } else {
                let basedOnEnum = new BasedOnEnumType();
                let possibleValues = basedOnEnum.getEnumValues(buildServices.components[targetModelName], targetModelName, buildServices);
                let validations = enumTemplate.getEnumValidator(possibleValues);

                buildServices.importsManager.import(helpers.capitalizeFirstLetter(targetModelName), buildServices.parsedConfigs.modelsPath);
                buildServices.serviceScripts.append(arrayMethodsTemplate.getTemplateForPermitiveType(propName, helpers.capitalizeFirstLetter( targetModelName), validations));
                buildServices.patchModelScripts.append(arrayMethodsTemplate.getPatchTemplate(propName));
                defaultValue = ``
            }
        } else {
            if (items.type && (
                items.type == IDataType.boolean || 
                items.type == IDataType.integer || 
                items.type == IDataType.null ||
                items.type == IDataType.number || 
                items.type == IDataType.object ||
                items.type == IDataType.string
            )) {
                defaultValue = helpers.getDefaultType(prop.type! as string ,prop.nullable);
                if (defaultValue == '[]') defaultValue ='';
            }
        }
        buildServices.formGroupProps.append(`${helpers.tabs}${propName}: this.fb.array([ ${defaultValue} ]) ,\n `);  
    } 

}
