import { IBuildServices, IDataType } from "../interfaces/ICurrentProp";
import { ITypeBuilder } from "./ITypeBuilder";
import { helpers } from "../helpers";
import { SchemaObject } from "../interfaces/schemaObject";
import { validationGenerator } from "./validationManager";

export class PermitiveType implements ITypeBuilder {
    build(propName: string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
        // ✅ Extract default value using central helper
        let defaultValue = helpers.getInitialValue({
            default: prop.default,
            nullable: prop.nullable,
            type: prop.type! as string
        });

        // ✅ Use centralized validator manager
        const isRequired = component.required?.includes(propName) ?? false;
        const validations = validationGenerator.getValidators(prop, isRequired);

        // ✅ Override default for special cases
        if (prop.format === 'date-time') {
            defaultValue = 'this.DatePipe.transform(new Date(), \'yyyy-MM-dd\') as string'; // assumes DatePipe is injected
        }

        // ✅ Append to form group
        buildServices.formGroupProps.append(`${helpers.tabs}${propName}:`);

        if (validations.length > 0) {
            buildServices.formGroupProps.append(`[ ${defaultValue} , Validators.compose([ ${validations.join(', ')} ]) ], \n`);
        } else {
            buildServices.formGroupProps.append(`${defaultValue}, \n`);
        }
    }
}
