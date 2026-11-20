import { helpers } from "../helpers";

export class formProvidersBarrelTemplate {
    /**
     * Generates a barrel file that exports provideAllFormBuilders()
     * so users don't have to manually list each form builder in component providers.
     */
    static getTemplate(modelKeys: string[]) {
        const imports = modelKeys
            .map(key => {
                const name = helpers.normalizeToFormBuilderName(key);
                return `import { ${name} } from './${key}';`;
            })
            .join('\n');

        const providerEntries = modelKeys
            .map(key => {
                const name = helpers.normalizeToFormBuilderName(key);
                return `    ${name}, ...${name}.Providers()`;
            })
            .join(',\n');

        const builderList = modelKeys
            .map(key => `  builders.push(${helpers.normalizeToFormBuilderName(key)});`)
            .join('\n');

        return `
${imports}

/**
 * Provides all generated form builders and their dependencies.
 * Use in component providers or route providers.
 *
 * @example
 * // In a component:
 * @Component({ providers: provideAllFormBuilders() })
 *
 * // Or selectively:
 * @Component({ providers: provideFormBuilders(UserFormBuilder, OrderFormBuilder) })
 */
export function provideAllFormBuilders(): any[] {
    return [
${providerEntries}
    ];
}

/**
 * Provide only specific form builders and their dependencies.
 *
 * @example
 * @Component({ providers: provideFormBuilders(UserFormBuilder, OrderFormBuilder) })
 */
export function provideFormBuilders(...builders: any[]): any[] {
    const providers: any[] = [];
    builders.forEach(b => {
        providers.push(b);
        if (typeof b.Providers === 'function') {
            providers.push(...b.Providers());
        }
    });
    return providers;
}

// Built with an explicit loop instead of one array literal: a literal of this many distinct
// builders overflows the compiler's union representation (TS2590).
export const ALL_FORM_BUILDERS: readonly unknown[] = (() => {
  const builders: unknown[] = [];
${builderList}
  return builders;
})();
`;
    }
}
