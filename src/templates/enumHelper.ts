export class enumTemplate {
    static getTemplate() {
        return `
export class enumHelper {
    static nameToSatetment(name: string) {
        if (name == null) return '';
        return name
            .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
            .replace(/^./, function (str) { return str.toUpperCase(); })
            .trim();
    }

    static getValByName(enumObj: any, name: string): number | undefined {
        return enumObj[name];
    }
    static getNameByVal(enumObj: any, value: number): string {
        return Object.keys(enumObj).find(key => enumObj[key] === value) || '';
    }
    static getAllEnumValues<T>(enumObj: any): Array<T[keyof T]> {
        return Object.values(enumObj).filter(value => typeof value === 'number') as Array<T[keyof T]>;
    }
    static getAllEnumNames<T>(enumObj: any): Array<keyof T> {
        return Object.keys(enumObj).filter(key => isNaN(Number(key))) as Array<keyof T>;
    }
    static hasValue<T>(enumObj: any, value: T[keyof T]): boolean {
        return Object.values(enumObj).includes(value);
    }
    static hasName<T>(enumObj: any, name: string): boolean {
        return Object.keys(enumObj).includes(name);
    }
    static ToKeyValArray<T>(enumObj: any): Array<{ key: keyof T, value: T[keyof T] }> {
        return Object.keys(enumObj)
            .filter(key => isNaN(Number(key))) // Filter out numeric keys
            .map(key => ({
                key: key as keyof T,
                value: enumObj[key as keyof T]
            }));
    }
}
        `
    }

    public static getEnumValidator(values: string) {
        return `Validators.compose([ oneOfValidator( [ ${ values } ] ) ] )`;
    }
}