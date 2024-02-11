export default class scriptManager {
    private scripts: string = '';

    append(script: string) {
        this.scripts += `${script}`;
    }

    toString() {
        return this.scripts;
    }
}