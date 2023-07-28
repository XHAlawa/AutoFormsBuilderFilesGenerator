export class propFunctionsTemplate {
    static getTemplate(propName: string) {
        return `
    get ${propName}Ctrl(): FormControl {
      return this.form.get('${propName}') as FormControl;
    }

    get ${propName}ValueChanges$() {
      return this.${propName}Ctrl?.valueChanges;
    }
        `
    }
}