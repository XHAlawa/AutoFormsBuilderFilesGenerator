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

    // True when importing targetModelName inside currentModel would create a static import cycle
    isPartOfCycle(currentModelName: string, targetModelName: string): boolean {
        if (currentModelName.toLowerCase() === targetModelName.toLowerCase()) return true;

        this.resolving.clear();
        return this.reaches(targetModelName, currentModelName);
    }

    private reaches(fromModelName: string, goalModelName: string): boolean {
        if (fromModelName.toLowerCase() === goalModelName.toLowerCase()) return true;

        const component = this.components[fromModelName];
        if (component == null) return false;

        this.resolving.add(fromModelName);

        const found = this.getReferenceTargets(component).some(targetName => {
            if (this.resolving.has(targetName)) return false;
            return this.reaches(targetName, goalModelName);
        });

        this.resolving.delete(fromModelName);
        return found;
    }
}
