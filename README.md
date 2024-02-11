# Auto Reactive Forms Builder Generator Based On Open Api

[![Socket Badge](https://socket.dev/api/badge/npm/package/angular-formsbuilder-gen)](https://socket.dev/npm/package/angular-formsbuilder-gen)

  

This NPM module generates build form class from an OpenApi, The generated classes follow the principles of Angular. The generated code is compatible with Angular 12+.

  

Most of angular developers takes time on writeing form group objects or use form builder to generated models based on

openapi scheme , which can take long time so I've decided to use formBuilder Helper class and wrote this tool to help

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
"schemeFile": "E://swagger.json"
}

```
**note** this file will be used also for **ng-openapi-gen** tool [Click here to know more about it](https://www.npmjs.com/package/ng-openapi-gen  "Click here to know more about it") in section "Configuration file and CLI arguments."

  

our tool cares only about properties "modelsPath, formsOutput, input"

- **Input**: url for open-api scheme json file
- **schemeFile**: local path for scheme json file it's hight order execution if it exist

scheme is loaded from local file instead of url even if url is set
- **models**: path for generated models **ng-openapi-gen**
- **formsOutput**: where should our tool generated formsbuilder classes

  
  

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
import { oneOfValidator, guidValidator } from  './CustomeValidators'; 
  

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
	this.form = this.fb.group({
		userName: [ '' , Validators.compose([ Validators.required, Validators.minLength(1) ]) ],
		password: [ '' , Validators.compose([ Validators.required ]) ],
		addresses: [ this.UserAddressDtoFormBuilderSrvc.buildForm() ],
	});
	if (model != null) {
		this.form.patchValue({ ...model });
	}
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

addressesArray():  FormArray {

return  this.form.controls['addresses'] as  FormArray;

}

addressesControls():  AbstractControl<any, any>[] {

return  this.addressesArray().controls;

}

deleteAddressesByIndex(index:  number):  void {
	this.addressesArray().removeAt(index);
}

addNewAddresses(model:  UserAddressDtoFormBuilder  |  null  =  null):  FormGroup<any> {
	let  frm  =  this.UserAddressDtoFormBuilderSrvc.buildForm(model);
	this.addressesArray().push(frm);
	return  frm;
}

addNewaddresses(model: UserAddressDto | null = null): FormGroup<any> {
	let frm = this.UserAddressDtoFormBuilderSrvc.buildForm(model);
	this.addressesArray().push(frm);
	return frm;
}

  

}

  

```
### What Is New?  
##### 1.0.36
- in this version I've made a refactor in core behaviour of generating the files in order 
  to support basic validations defined in swagger.json document.
 
 - fix some issues which causes missing props in some models.

 - fix issue of build related to custome validator guidValidator
 

### Generated File Content

- Fields: Contains variables used in file
- Constructor: Conatins default configuration
- Methods:
	-**buildForm** Method: Responsable for creating and updating generated form data.
	-Arrays and Navigation methods 
- Properties:
-Property Control: returns instance of control as FormControl
-Property ValueChange: returns observable of Control Value Changes

## Features

- Generate Angular **FormsBuilder** Class for All Models
- You Can Extend Class Functionality by inheritance In Sperate Service File
- Write Controls Getters for Better IntelliSense
- Give you a high productivity in implementing different forms because I you will save time of writing different **reactive forms** 'formbuilder object' and focuse on writing required logic of form. 