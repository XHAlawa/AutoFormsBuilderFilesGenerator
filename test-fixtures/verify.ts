import * as fs from 'fs';
import * as path from 'path';

// Run from the repository root: npx ts-node test-fixtures/verify.ts
import { spawnSync } from 'child_process';

const root = path.resolve(process.cwd());
const fixtures = [
    { config: 'test-config.json', output: 'out' },
    { config: 'nested-config.json', output: 'out-nested' },
    { config: 'exclude-all-config.json', output: 'out-only' }
];

const models = `export interface Employee { id: number; name: string; manager?: Employee; team?: Employee[]; department?: Department; }
export interface Department { id: number; title: string; head?: Employee; address?: Address; }
export interface Customer { id: number; addresses?: Address[]; }
export interface Project { id: number; name: string; }
export interface Task { id: number; title: string; project?: Project; labels?: Status[]; items?: Project[]; }
export interface Address { city: string; street: string; }
export enum Status { open = 'open', closed = 'closed', pending = 'pending' }
`;

let failures = 0;

function check(name: string, condition: boolean) {
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`);
    if (!condition) failures++;
}

function run(configFile: string) {
    const result = spawnSync(process.execPath, [path.join(root, 'bin', 'src', 'index.js'), configFile], {
        cwd: root,
        encoding: 'utf-8'
    });
    return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function readOutput(output: string, file: string) {
    return fs.readFileSync(path.join(root, 'test-fixtures', output, file), 'utf-8');
}

const apiDir = path.join(root, 'test-fixtures', 'api', 'models');
fs.mkdirSync(apiDir, { recursive: true });
fs.writeFileSync(path.join(apiDir, 'index.ts'), models, { encoding: 'utf-8' });

fixtures.forEach(f => {
    const outputDir = path.join(root, 'test-fixtures', f.output);
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
    run(path.join('test-fixtures', f.config));
});

console.log('\n=== cyclic + excluded model ===');
const employee = readOutput('out', 'Employee.ts');
check('Employee does not import its own form builder', !/from '\.\/Employee'/.test(employee));
check('Employee resolves itself through the Injector', /InjectorSrvc\.get\(EmployeeFormBuilder\)/.test(employee));
check('Employee providers do not expand its own Providers()', !/\.\.\.EmployeeFormBuilder\.Providers\(\)/.test(employee));
check('Employee keeps the providers entry', /return \[ EmployeeFormBuilder,/.test(employee));
check('Employee nests Department through its own builder', /import \{ DepartmentFormBuilder \} from '\.\/Department'/.test(employee));
check('Employee imports nothing from the excluded Address model', !/Address/.test(employee));
check('Excluded Address form builder file is not generated', !fs.existsSync(path.join(root, 'test-fixtures', 'out', 'Address.ts')));
check('Customer no longer imports AddressFormBuilder', !/AddressFormBuilder/.test(readOutput('out', 'Customer.ts')));
check('Customer drops the excluded array property', !/addressesArray\(\)/.test(readOutput('out', 'Customer.ts')));
check('Status enum array still generated', /labelsArray\(\)/.test(readOutput('out', 'Task.ts')));

console.log('\n=== non cyclic nested model ===');
const nestedTask = readOutput('out-nested', 'Task.ts');
check('Task imports ProjectFormBuilder statically', /import \{ ProjectFormBuilder \} from '\.\/Project'/.test(nestedTask));
check('Task injects ProjectFormBuilder in the constructor', /private ProjectFormBuilderSrvc: ProjectFormBuilder/.test(nestedTask));
check('Task providers list the nested builders', /return \[ TaskFormBuilder,ProjectFormBuilder,/.test(nestedTask));

console.log('\n=== exclude all (wildcard) ===');
const outputOnlyFiles = fs.readdirSync(path.join(root, 'test-fixtures', 'out-only'));
check('Only includeModels form builders are generated', !outputOnlyFiles.includes('Address.ts') && !outputOnlyFiles.includes('Employee.ts'));
check('Customer form builder is still generated', outputOnlyFiles.includes('Customer.ts'));
check('Excluded Address is not imported by Customer', !/AddressFormBuilder/.test(readOutput('out-only', 'Customer.ts')));

console.log('\n=== form builder feature parity (vendor fork) ===');
for (const [name, pattern] of [
    ['getControl selector', /getControl\(selector: \(model: Employee\) => any\)/],
    ['setFieldValue', /setFieldValue\(selector:/],
    ['watchField', /watchField\(selector:/],
    ['submit with loading state', /submit<R>\(saveFn:/],
    ['isSubmitting flag', /get isSubmitting\(\): boolean/],
    ['markAllTouched', /markAllTouched\(\): void/],
    ['disableAll / enableAll', /disableAll\(\): void[\s\S]*enableAll\(\): void/],
    ['clone', /clone\(\): FormGroup/],
    ['persistTo / restoreFrom', /persistTo\(storageKey:[\s\S]*restoreFrom\(storageKey:/],
    ['clearPersisted', /clearPersisted\(storageKey:/]
] as [string, RegExp][]) {
    check(`Employee exposes ${name}`, pattern.test(employee));
}
check('Employee imports Observable for submit', /import \{ Observable \} from 'rxjs'/.test(employee));

const guard = readOutput('out', 'UnsavedChangesGuard.ts');
check('UnsavedChangesGuard generated', /export class UnsavedChangesGuard implements CanDeactivate/.test(guard));

const providers = readOutput('out', 'FormProviders.ts');
check('FormProviders exports provideAllFormBuilders', /export function provideAllFormBuilders\(\)/.test(providers));
check('FormProviders exports provideFormBuilders', /export function provideFormBuilders\(/.test(providers));
check('FormProviders exports ALL_FORM_BUILDERS', /export const ALL_FORM_BUILDERS/.test(providers));
check('FormProviders lists generated builders', /builders\.push\(TaskFormBuilder\);/.test(providers));
check('FormProviders omits excluded Address builder', !/AddressFormBuilder/.test(providers));

console.log('\n=== generated code typecheck ===');
const tsc = spawnSync(path.join(root, 'test-fixtures', 'node_modules', '.bin', 'tsc.cmd'), ['-p', 'tsconfig.check.json'], {
    cwd: path.join(root, 'test-fixtures'),
    encoding: 'utf-8',
    shell: true
});
if (fs.existsSync(path.join(root, 'test-fixtures', 'node_modules'))) {
    check('tsc on generated files', tsc.status === 0);
    if (tsc.status !== 0) console.log(tsc.stdout, tsc.stderr);
} else {
    console.log('SKIP generated code typecheck (run npm install inside test-fixtures first)');
}

fs.rmSync(path.join(root, 'test-fixtures', 'api'), { recursive: true, force: true });

console.log(failures === 0 ? '\nAll checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);


