import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";
import { ReferenceObject, SchemaObject } from "../interfaces/schemaObject";
import { formBuilderTemplate } from "../templates/formBuilderService";
import { childFormBuilderReference } from "./childFormBuilderReference";

export class ObjectRefType {
    build(propName: string, prop: SchemaObject, component: SchemaObject, buildServices: IBuildServices) {
        const castedProp = prop as any as ReferenceObject;
        const targetModelName = castedProp.$ref.replace(helpers.componentsPath, '');
        const normalizedName = helpers.normalizeToFormBuilderName(targetModelName);

        // Cyclic references (self references) are resolved through the Injector without a
        // static import, otherwise the generated file would import itself.
        const reference = childFormBuilderReference.resolve(targetModelName, buildServices.currentModelName, buildServices);
        buildServices.importsManager.import(helpers.capitalizeFirstLetter(targetModelName), buildServices.parsedConfigs.modelsPath);

        buildServices.formGroupProps.append(`${helpers.tabs}${propName}: ${childFormBuilderReference.getPropertyTemplate(reference, buildServices)} ,\n`);

        buildServices.patchModelScripts.append(`${helpers.tabs}${helpers.tabs1}if (model.${propName}) {\n` +
            `${helpers.tabs}${helpers.tabs1}${helpers.tabs1}(this.form.get('${propName}') as FormGroup).patchValue(model.${propName});\n` +
            `${helpers.tabs}${helpers.tabs1}}\n`);

        buildServices.serviceScripts.append(`
    get ${propName}FormBuilder(): ${normalizedName} {
      return ${childFormBuilderReference.getGetterTemplate(reference)};
    }
    get ${propName}Group(): FormGroup {
      return this.form.get('${propName}') as FormGroup;
    }
`);
    }
}
