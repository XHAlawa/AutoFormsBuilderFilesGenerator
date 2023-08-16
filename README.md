# Auto Reactive Forms Builder Generator Based On Open Api 
This NPM module generates build form class from an OpenApi, The generated classes follow the principles of Angular. The generated code is compatible with Angular 12+.

Most of angular developers takes time on writeing form group objects or use form builder to generated models based on 
openapi scheme , which can take long time  so I've decided to use formBuilder Helper class and wrote this tool to help
by auto generated formbuilder scripts for each model

# Installing and running
If you want to install "angular-formsbuilder-gen" globally or just on your project
``` 
npm install -g ng-openapi-gen 
npm install -g angular-formsbuilder-gen
```
Then If you want to use it first you need to create configuration file in root of your 
angular app let's call it **'swagger.json'** which should contains following object 
```
{
  "$schema": "node_modules/ng-openapi-gen/ng-openapi-gen-schema.json",
  "input": "https://localhost:44325/swagger/v1/swagger.json",
  "output": "./src/app/api",
  "ignoreUnusedModels": false,

  "modelsPath": "./../api/models",
  "formsOutput": "/src/app/forms"
}
```
**note** this file will be used also for **ng-openapi-gen** tool [Click here to know more about it](https://www.npmjs.com/package/ng-openapi-gen "Click here to know more about it") in section "Configuration file and CLI arguments"  

our tool carse only about properties "modelsPath,  formsOutput, input"
- Input: url for open-api scheme json file
- models: path for generated models **ng-openapi-gen**
- formsOutput: where should our tool generated formsbuilder classes

### Generate Services And Models
first we need to generated services and models by using **ng-openapi-gen** 
Execute Following Command:
```
ng-openapi-gen -c swagger.json
```
Note: Make sure files are generated in "output" path defined in **swagger.json**

### Generate FormsBuilder Classes
to generate angular you models formsbuilder classes
Execute Following Command:
```
ng-frmGenerator swagger.json 
```
or you can use 
```
ng-frmGenerator
```
only because default filename for configuration is "swagger.json"


### Example
following example is for simple user information
```

import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormArray, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { IFormBuilder } from './IFormBuilder';
import { CustomerDto, UserAddressDto } from './../api/models';
import { UserAddressDtoFormBuilder } from './UserAddressDto';

@Injectable({ providedIn: 'root' })
export class CustomerDtoFormBuilder implements IFormBuilder<CustomerDto> {
  DatePipe: DatePipe = null as any;
  DateFormat: string = 'yyyy-MM-dd';
  form: FormGroup = null as any;

  constructor(private fb: FormBuilder
    , private UserAddressDtoFormBuilderSrvc: UserAddressDtoFormBuilder

  ) {
    this.DatePipe = new DatePipe('en-US');
  }

  updateCulture(culture: string = 'en-US') {
    this.DatePipe = new DatePipe(culture);
  }

  resetForm() {
    this.form.reset();
  }

  buildForm(model: CustomerDto | null = null) {
    this.form = this.fb.group<CustomerDto>({
      userName: null,
      password: null,
      addresses: [],
    });
    if (model != null) {
      this.form.patchValue({ ...model });
    }

    ['addresses',].forEach(arr => this.form.setControl(arr, this.fb.array([])))

    return this.form;
  }

  get userNameCtrl(): FormControl {
    return this.form.get('userName') as FormControl;
  }

  get userNameValueChanges$() {
    return this.userNameCtrl?.valueChanges;
  }


  get passwordCtrl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get passwordValueChanges$() {
    return this.passwordCtrl?.valueChanges;
  }


  addressesArray(): FormArray {
    return this.form.controls['addresses'] as FormArray;
  }
  addressesControls(): AbstractControl<any, any>[] {
    return this.addressesArray().controls;
  }
  deleteaddressesByIndex(index: number): void {
    this.addressesArray().removeAt(index);
  }
  addNewaddresses(model: UserAddressDto | null = null): FormGroup<any> {
    let frm = this.UserAddressDtoFormBuilderSrvc.buildForm(model);
    this.addressesArray().push(frm);
    return frm;
  }

}

```

### Generated File Content
- Fields: Contains variables used in file
- Constructor: Conatins default configuration
- Methods: 
	-**buildForm** Method: Responsable for creating and updating generated form data.
- Getters:
	- Properties: 
		-Property Control: returns instance of control as FormControl
		-Property ValueChange: returns observable of Control Value Changes

## Features
- Generate Angular FormsBuilder Class for All Models
- You Can Extend Class Functionality by inheritance In Sperated Service File
- Write Controls Getters For Better  Intellisense
