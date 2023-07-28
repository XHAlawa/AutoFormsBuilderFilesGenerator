import { arrayMethodsTemplate } from './templates/arrayMethods';
import { helpers } from './helpers.js';
import injectServicesManager from './injectServicesManager.js';
import { ICurrentProp } from './interfaces/ICurrentProp.js';

export default class arrayGenerator {
    private static propsAsArrays: Set<string> = new Set();

    static CreateArrayProp(property: ICurrentProp): void {
        const propInfo = property.Property;
        arrayGenerator.propsAsArrays.add(property.PropertyName);
        
        //Normal Array
        if (propInfo.items == null || propInfo.items.$ref == null) return;

        let ref = this.replacePath(propInfo.items?.$ref ?? '');
        let refNormalizedName = helpers.normalizeToFormBuilderName(ref);
        let selfCall = ref.toLowerCase() === property.DtoName.toLowerCase();

        // methods call throw ?
        let caller = 'this';
        if (!selfCall)  {
            property.Services.injectManager.inject( refNormalizedName );
            caller = `this.${refNormalizedName}Srvc`;
        }

        property.Services.importsManager.import( ref , property.Services.parsedConfigs.modelsPath);
        if (ref.toLowerCase() != property.DtoName.toLowerCase())
            property.Services.importsManager.import( refNormalizedName , "./" + ref);
        

        // build array methods
        property.Services.extraScriptManager.append(
            arrayMethodsTemplate.getTemplate(property, caller, ref)
        );
    }
 
    private static replacePath(path: string): string {
        let paths = path.split('/');
        return helpers.capitalizeFirstLetter(paths[paths.length - 1]);
    }

    static toString() {
        if (arrayGenerator.propsAsArrays.size == 0) {
            return '';
        }
        let script = `${helpers.tabs2}[` , counter = 0;
        arrayGenerator.propsAsArrays.forEach(p => {
            script += `'${p}',`;
            script += (counter > 3 ) ? '\n' : '' ;
            counter = counter > 3 ?  -1 : counter;
            counter++;
        });
        arrayGenerator.propsAsArrays.clear();
        script += `].forEach(arr => this.form.setControl(arr, this.fb.array([]) ))`;

        return script;
    }

    

  
}