import { helpers } from '../helpers';
import { IBuildServices, IDataType } from '../interfaces/ICurrentProp';
import { ReferenceObject, SchemaObject } from '../interfaces/schemaObject';
import { arrayMethodsTemplate } from '../templates/arrayMethods';
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
                buildServices.importsManager.import(helpers.normalizeToFormBuilderName(  targetModelName), `./${targetModelName}`)
                buildServices.injectManager.inject(helpers.normalizeToFormBuilderName( targetModelName) );
                defaultValue = `this.${helpers.normalizeToFormBuilderName( targetModelName)}Srvc.buildForm()`

                buildServices.serviceScripts.append(arrayMethodsTemplate.getTemplate(propName, helpers.normalizeToFormBuilderName( targetModelName)))
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
                }
            }
        }
        buildServices.formGroupProps.append(`${helpers.tabs}${propName}: this.fb.array([ ${defaultValue} ]) ,\n `);  
    } 

}