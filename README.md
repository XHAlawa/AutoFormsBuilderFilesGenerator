# Accelerate Angular Development with Auto Reactive Forms Builder Generator Based On Open API

[![Socket Badge](https://socket.dev/api/badge/npm/package/angular-formsbuilder-gen)](https://socket.dev/npm/package/angular-formsbuilder-gen)

Unlock enhanced productivity in Angular development with our innovative NPM module! Seamlessly generate form classes directly from OpenAPI specifications, ensuring adherence to Angular best practices. Our solution is tailored for Angular 12 and above, offering compatibility and reliability.

Save valuable time and resources by automating the creation of form group objects. Say goodbye to manual labor and tedious form building processes. Our tool empowers developers with a FormBuilder Helper class, effortlessly generating FormBuilder scripts for each model. Experience streamlined development workflows and expedited project delivery with our intuitive solution.

Optimize your Angular development workflow today and elevate your productivity to new heights!

---

# Installation and Usage

## Installing the Module

To install "angular-formsbuilder-gen" globally or within your project, run the following commands:

```sh
npm install -g ng-openapi-gen
npm install -g angular-formsbuilder-gen
```
## Configuration

Create a configuration file named swagger.json in the root of your Angular app with the following content:
```
{
  "$schema": "node_modules/ng-openapi-gen/ng-openapi-gen-schema.json",
  "input": "https://localhost:44325/swagger/v1/swagger.json",
  "output": "./src/app/api",
  "ignoreUnusedModels": false,
  
  "modelsPath": "./../api/models",
  "formsOutput": "/src/app/forms",
  "schemeFile": "E://swagger.json"
}

```

Note: This file is also used by the  [**ng-openapi-gen** ](https://www.npmjs.com/package/ng-openapi-gen  "Click For more information") tool. 


Our tool specifically uses the properties modelsPath, formsOutput, and input:

- **Input**: URL for the OpenAPI schema JSON file.
- **schemeFile**: Local path for the schema JSON file, which takes precedence if it exists.
- **modelsPath**: Path for generated models from ng-openapi-gen.
- **formsOutput**: Path for generated FormBuilder classes.


### Generating Services and Models

First, generate services and models using **ng-openapi-gen** :
```
ng-openapi-gen -c swagger.json
```
Ensure that files are generated in the "output" path defined in swagger.json.
---
### Generating FormsBuilder Classes

To generate Angular models' FormBuilder classes, execute the following command:
```
ng-frmGenerator swagger.json
or
ng-frmGenerator
```

only because default filename for configuration is **"swagger.json"**

### Example

Here is an example of a generated FormBuilder class for a simple user information form:
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
 
---

```
### What Is New?  
#### Version 1.0.50
   - Fix Bug In Guid Custome Validator
#### Version 1.0.49

- **Core Changes:**
  - All generated classes must now be registered as transient services in Angular components.
  - Users can retrieve all sub-services by calling the static method `.provider()`.

  ```
  @Component({
    selector: 'app-example',
    templateUrl: './example.component.html',
    providers: [CustomerDtoFormBuilder.provider()]
  })
  export class ExampleComponent {
    constructor(private customerDtoFormBuilder: CustomerDtoFormBuilder) {
      // Use the form builder service
    }
  }
  ```
  The `.provider()` method ensures all dependent services are registered correctly, allowing for seamless integration and usage within your components.

- **Enhanced Functionality for FormArrays:**
  - Added functionality to access and manage FormArrays using the generated services.
  - New methods allow for easier handling of FormArray elements, including adding new elements and accessing specific elements by index.

  ```typescript
  addressesFormAt(index: number) {
    return (this.addressesArray().controls[index] as any).__formGroupManager as UserAddressDtoFormBuilder;
  }

  addNewAddress(model: UserAddressDto | null = null): FormGroup<any> {
     let formInstance = this.InjectorSrvc.get(UserAddressDtoFormBuilder);
    let frm = formInstance.buildForm(model);
    (frm as any).__formGroupManager = formInstance;
    this.addressesArray().push(frm);
    return frm;
  }
  ```
  This enhancement provides a structured way to manage nested FormGroups within FormArrays, improving the flexibility and maintainability of your form structures. You can now manage FormArrays using our services, making it easier to handle complex forms in your Angular applications.

##### Version 1.0.45
* Fix Issue Where Enums In Some Cases Injected As Form builder
* New Features
	* EnumHelper
		* nameToSatetment: Converts Enum Pascal Key Into Readable Text Example: UserFinanceCompleted ->  'User Finance Completed'
		* getValByName: Gets Value Of Enum Key Example: { red: 2 } -> getValByName('red') return 2
		* getNameByVal: Gets Value Of Enum Key Example: { red: 2 } -> getNameByVal(2) return 'red'
		* getAllEnumValues: Returns All Values Of Enum Example: { red: 2, blue:5 } return [ 2, 5 ]
		* getAllEnumNames: Returns All Names Of Enum Example: { red: 2, blue:5 } return [ 'red', 'blue' ]
		* hasValue: Checks If Enum Has Value Example: { red: 2 } -> HasValue(2) return true
		* hasName: Checks If Enum Has Name Example: { red: 2 } -> hasName('red') return true
		* ToKeyValArray: Returns List Of { key, value } Of Enum Example: { red: 2, blue:5 } 
			returns [ { key: 'red', value: 2 } ] useful in cases of using enum as data source for drop down
	* DateHelper
		* addDays: Add Number Of Days To Date
		* addMonths: Add Number Of Months To Date
		* addYears: Add Number Of Years To Date
		* diffInDays: Get Diff Between Two Dates In Days
		* diffInMonths: Get Diff Between Two Dates In Months
		* diffInYears: Get Diff Between Two Dates In Years
	* ShowForErrorDirective
		* showForError: used to show dome if control has sepcific error
		```
		<form [formGroup]="myFormGroup">
  			<!-- Other form elements -->
		  	<div showForError="required" formControlName="controlName">
    		This will show if 'invalidCharacters' error exists.
  			</div>
  			<!-- Other form elements -->
		</form>
		```
---
## Features

- Generate Angular **FormsBuilder** Class for All Models
- You Can Extend Class Functionality by inheritance In Sperate Service File
- Write Controls Getters for Better IntelliSense
- Give you a high productivity in implementing different forms because I you will save time of writing different **reactive forms** 'formbuilder object' and focuse on writing required logic of form. 