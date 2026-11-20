import { helpers } from "../helpers";
import { IBuildServices } from "../interfaces/ICurrentProp";
import { SchemaObject } from "../interfaces/schemaObject";
import { ReferenceObject } from "../interfaces/schemaObject";
import { formBuilderTemplate } from "../templates/formBuilderService";

export interface IChildFormBuilderReference {
    targetModelName: string;
    formBuilderName: string;
    // False when the nested builder is resolved through the Injector instead of being injected
    isInjected: boolean;
    // True when the property points back at the model that owns it
    isSelfReference?: boolean;
}

export class childFormBuilderReference {
    // Arrays sometimes wrap their item type in allOf/oneOf/anyOf instead of a plain $ref
    static resolveComposition(items: any): any {
        if (items == null) return {};
        if (typeof items.$ref === 'string') return items;

        const composition = items.allOf || items.oneOf || items.anyOf;
        if (Array.isArray(composition)) {
            const refEntry = composition.find((entry: any) => entry != null && typeof entry.$ref === 'string');
            if (refEntry) return refEntry;
        }

        return items;
    }

    // Returns null when the reference cannot be generated
    // (excluded model, model outside includeModels, or missing schema)
    static getTargetModelName(prop: SchemaObject, services: IBuildServices): string | null {
        const reference = prop as any as ReferenceObject;
        if (reference == null || typeof reference.$ref !== 'string') return null;

        const targetModelName = reference.$ref.replace(helpers.componentsPath, '');

        if (services.components[targetModelName] == null) return null;
        if (childFormBuilderReference.isModelExcluded(targetModelName, services)) return null;

        return targetModelName;
    }

    static isModelExcluded(modelName: string, services: IBuildServices): boolean {
        const includeModels = (services.parsedConfigs.includeModels ?? []).filter(x => x !== '*');
        const excludeModels = services.parsedConfigs.excludeModels ?? [];

        if (excludeModels.includes('*'))
            return !includeModels.some(x => x.toLowerCase() === modelName.toLowerCase());

        if (includeModels.length > 0 && !includeModels.some(x => x.toLowerCase() === modelName.toLowerCase()))
            return true;

        return excludeModels.some(x => x.toLowerCase() === modelName.toLowerCase());
    }

    static resolve(targetModelName: string, parentModelName: string, services: IBuildServices): IChildFormBuilderReference {
        const formBuilderName = helpers.normalizeToFormBuilderName(targetModelName);

        if (childFormBuilderReference.isCyclic(parentModelName, targetModelName, services)) {
            // Self references are never imported or nested, they become a plain control
            return { targetModelName, formBuilderName, isInjected: false, isSelfReference: true };
        }

        // False means the instance is already injected in the parent constructor, reuse it
        const isInjected = !services.injectManager.inject(formBuilderName);

        services.importsManager.import(formBuilderName, `./${targetModelName}`);

        if (isInjected) {
            services.serviceProviders.append(formBuilderTemplate.getProvidersTemplate(targetModelName, parentModelName));
        } else {
            services.serviceProviders.append(formBuilderTemplate.getDirectProviderTemplate(targetModelName));
        }

        return { targetModelName, formBuilderName, isInjected };
    }

    static getGetterTemplate(reference: IChildFormBuilderReference) {
        return reference.isInjected
            ? `this.${reference.formBuilderName}Srvc`
            : `this.InjectorSrvc.get(${reference.formBuilderName})`;
    }

    // A self reference must not nest its own builder: buildForm() would recurse forever.
    // It becomes a plain control that is patched directly.
    static getPropertyTemplate(reference: IChildFormBuilderReference, services: IBuildServices) {
        if (reference.isSelfReference) return `this.fb.control(null)`;
        return `${childFormBuilderReference.getGetterTemplate(reference)}.buildForm()`;
    }

    // True when importing the target inside the parent would create a static import cycle
    static isCyclic(parentModelName: string, targetModelName: string, services: IBuildServices) {
        return parentModelName != null
            && parentModelName.toLowerCase() === targetModelName.toLowerCase();
    }
}
