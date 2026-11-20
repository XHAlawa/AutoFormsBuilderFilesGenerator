import { helpers } from "../helpers";
import { IParsedConfig } from "../interfaces/IParsedConfig";

export class referenceGraph {
    private resolving = new Set<string>();

    constructor(private components: any, private parsedConfig: IParsedConfig, private generatedModels: string[]) {
    }

    // A model is excluded when it was filtered out from the generated model list
    isExcluded(modelName: string): boolean {
        return !this.generatedModels.some(x => x.toLowerCase() === modelName.toLowerCase());
    }

    private getReferenceTargets(component: any): string[] {
        if (component == null) return [];

        const targets: string[] = [];

        const addTarget = (value: any) => {
            if (value == null || typeof value.$ref !== 'string') return;
            const targetName = value.$ref.replace(helpers.componentsPath, '');
            if (targets.indexOf(targetName) === -1) targets.push(targetName);
        };

        Object.keys(component.properties ?? {}).forEach(propName => {
            const prop = component.properties[propName];
            addTarget(prop);
            addTarget(prop?.items);
        });

        (component.allOf ?? []).forEach(x => addTarget(x));

        return targets;
    }

    // Returns every model reachable from the given model (itself included)
    getAllDependencies(modelName: string): Set<string> {
        const visited = new Set<string>();
        this.collectDependencies(modelName, visited, new Set<string>());
        return visited;
    }

    private collectDependencies(modelName: string, visited: Set<string>, path: Set<string>) {
        if (visited.has(modelName) || path.has(modelName)) return;

        const component = this.components[modelName];
        if (component == null) return;

        path.add(modelName);

        this.getReferenceTargets(component).forEach(targetName => {
            if (this.isExcluded(targetName)) return;
            visited.add(targetName);
            this.collectDependencies(targetName, visited, path);
        });

        path.delete(modelName);
    }

    // True only when a static import would make the generated file reference itself.
    // Real world schemas are full of long mutual reference chains (Appointment -> Clinic ->
    // Appointment). Those are NOT import cycles: Clinic.ts never imports AppointmentFormBuilder
    // because a property that points back at the owner is built as a plain control/array.
    // Only a direct self reference turns into `import { XFormBuilder } from './X'` inside X.ts.
    isPartOfCycle(currentModelName: string, targetModelName: string): boolean {
        return currentModelName.toLowerCase() === targetModelName.toLowerCase();
    }

    // Kept for callers that need the full transitive reachability of a model
    getAllReachable(currentModelName: string): Set<string> {
        return this.getAllDependencies(currentModelName);
    }
}
