export default class extraScriptManager {
    scripts: string = '';

    append(script: string) {
        this.scripts += `\n ${script}`;
    }

    toString() {
        return this.scripts;
    }
}