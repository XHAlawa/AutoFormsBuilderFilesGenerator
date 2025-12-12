export class formsHelpers {
    static getTemplate() {
        return `
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export type valueOf<T> = T[keyof T];
export function findName<T, V extends T[keyof T]>(f: (x: T) => V): valueOf<{ [K in keyof T]: T[K] extends V ? K : never }>;
export function findName(f: (x: any) => any): keyof any {
    var p = new Proxy({}, {
        get: (target, key) => key
    })
    return f(p);
}


export function namesOf<T, V extends T[keyof T] = any>(fs: ((x: T) => V)[]): string[] {
    let keys: string[] = [];
    fs.forEach(f => {
        keys.push(findName<T, V>(f) as string);
    })
    return keys;
}


export function emptyId() {
    return '00000000-0000-0000-0000-000000000000';
}

export function newId() { 
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function removeControls<T, V extends T[keyof T] = any>(fs: ((x: T) => V)[], frm: FormGroup) {
    let names = namesOf<T, V>(fs);
    names.forEach(n => { frm.removeControl(n) });
}

export function setRequired(controls: string[], frm: FormGroup) {
    controls.forEach(ctrl => frm.controls[ctrl].setValidators(Validators.required))
}
export function markAsRequired<T, V extends T[keyof T] = any>(fs: ((x: T) => V)[], frm: FormGroup) {
    let names = namesOf<T, V>(fs);
    setRequired(names, frm);
}

export function markAllAsRequired(frm: FormGroup) {
    markAllAsRequiredExcept(frm, []);
} 

export function markAllAsRequiredExcept<T, V extends T[keyof T] = any>(frm: FormGroup, fs: ((x: T) => V)[]) {
    let ctrls = frm.controls as any;
    let names = namesOf<T, V>(fs);
    Object.keys(ctrls).forEach(k => { HandleFormContorl(ctrls[k], k, names); })
} 

function HandleFormContorl(a: AbstractControl<any>, ctrlName: string, except: string[]) {
    if (except.includes(ctrlName)) return;
    if (a instanceof FormArray) {
    Object.keys(a.controls).forEach(k => {
        HandleFormContorl((a.controls as any)[k], k, except);
    });
    } else {
        if (!(a as FormControl).hasValidator(Validators.required))
            (a as FormControl).addValidators(Validators.required);
    }
}
        
        `;
    }
}