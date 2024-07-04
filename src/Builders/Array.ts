import { helpers } from '../helpers';
import { IBuildServices, IDataType } from '../interfaces/ICurrentProp';
import { ReferenceObject, SchemaObject } from '../interfaces/schemaObject';
import { arrayMethodsTemplate } from '../templates/arrayMethods';
import { enumTemplate } from '../templates/enumHelper';
import { formBuilderTemplate } from '../templates/formBuilderService';
import { propFunctionsTemplate } from '../templates/propsFunctions';
import { BasedOnEnumType } from './BasedOnEnumType';
import { ITypeBuilder } from './ITypeBuilder';
import { PermitiveType } from './PermitiveType';
export class ArrayType implements ITypeBuilder{
    build(propName:string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
    
        let defaultValue: string | null | undefined = '';
        if (prop.nullable!) {
            defaultValue = 'null';
        } else {
            // Check For Items Type 
            if ((prop.items! as ReferenceObject).$ref) {
                let castedItems = (prop.items! as ReferenceObject).$ref;
                let targetModelName = castedItems.replace(helpers.componentsPath, ''  );
                // Check If Target Is Enum 
                if (!buildServices.components[targetModelName].enum)  {

                    buildServices.importsManager.import(helpers.normalizeToFormBuilderName(targetModelName), `./${targetModelName}`)
                    buildServices.importsManager.import(helpers.capitalizeFirstLetter(targetModelName), buildServices.parsedConfigs.modelsPath)
                    buildServices.serviceProviders.append(formBuilderTemplate.getProvidersTemplate(targetModelName, ''));
                    buildServices.serviceScripts.append(arrayMethodsTemplate.getTemplate(propName, helpers.capitalizeFirstLetter( targetModelName)));
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
                let castedItems = prop.items! as SchemaObject;
                if (castedItems.type && (
                    castedItems.type == IDataType.boolean || 
                    castedItems.type == IDataType.integer || 
                    castedItems.type == IDataType.null ||
                    castedItems.type == IDataType.number || 
                    castedItems.type == IDataType.object ||
                    castedItems.type == IDataType.string
                )) {
                    defaultValue = helpers.getDefaultType(prop.type! as string ,prop.nullable);
                    if (defaultValue == '[]') defaultValue ='';
                }
            }
        }
        buildServices.formGroupProps.append(`${helpers.tabs}${propName}: this.fb.array([ ${defaultValue} ]) ,\n `);  
    } 

}