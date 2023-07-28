export class helpers {
    static tabs2 = `\t\t`;
    static tabs = `\t\t\t`;
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } 

    static normalizeToFormBuilderName(name: string) {
        return helpers.capitalizeFirstLetter(name) + 'FormBuilder';
    }
}