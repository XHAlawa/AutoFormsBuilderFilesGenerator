export class validationUiHelpersTemplate {
  static getTemplate() {
    return `
import { Pipe, PipeTransform, Component, ChangeDetectionStrategy, Input, Directive, ElementRef, Renderer2, OnInit, OnDestroy, ViewContainerRef, TemplateRef } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { ValidationManager, ValidationMessageVM } from './ValidationManager';

export interface AfbShowErrorsOptions {
  generateHtml?: boolean;
}

@Pipe({ name: 'validationError', pure: false })
export class ValidationErrorPipe implements PipeTransform {
  transform(control: AbstractControl | null | undefined): string | null {
    if (!control) return null;
    return ValidationManager.getErrorMessage(control as any) ?? null;
  }
}

@Pipe({ name: 'validationErrors', pure: false })
export class ValidationErrorsPipe implements PipeTransform {
  transform(control: AbstractControl | null | undefined): ValidationMessageVM[] {
    if (!control) return [];
    return ValidationManager.getMessages(control as any);
  }
}

@Component({
  selector: 'afb-validation-errors',
  template: '<ng-container *ngIf="control">' +
            '<ul *ngIf="(errors$ | async) as errs">' +
            '<li *ngFor="let e of (showAll ? errs : (errs | slice:0:1))">' +
            '{{ e.message }}' +
            '</li>' +
            '</ul>' +
            '</ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationErrorsComponent {
  @Input() control: AbstractControl | null = null;
  @Input() showAll: boolean = false;

  errors$: Observable<ValidationMessageVM[]> | null = null;

  ngOnChanges(): void {
    if (this.control) {
      this.errors$ = ValidationManager.errors$(this.control);
    } else {
      this.errors$ = null;
    }
  }
}

@Directive({
  selector: '[afbAutoErrors]'
})
export class AfbAutoErrorsDirective implements OnInit, OnDestroy {
  @Input('afbAutoErrors') mode: 'submit' | 'manual' = 'submit';

  private hostElement: HTMLElement;
  private submitSub: any;

  constructor(
    private formGroupDirective: FormGroupDirective,
    host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {
    this.hostElement = host.nativeElement;
  }

  ngOnInit(): void {
    if (!this.formGroupDirective) {
      throw new Error('[afbAutoErrors] must be used on a form with [formGroup]');
    }

    const form: any = this.formGroupDirective.control;
    form.showValidationErrors = (options?: AfbShowErrorsOptions) => this.showErrors(options);

    if (this.mode === 'submit') {
      this.submitSub = this.formGroupDirective.ngSubmit.subscribe(() => {
        this.showErrors();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.submitSub && typeof this.submitSub.unsubscribe === 'function') {
      this.submitSub.unsubscribe();
    }
    const form: any = this.formGroupDirective.control;
    if (form && form.showValidationErrors) {
      delete form.showValidationErrors;
    }
  }

  private showErrors(options?: AfbShowErrorsOptions): void {
    const form = this.formGroupDirective.control;
    const root = this.hostElement;
    const generateHtml = options && options.generateHtml === false ? false : true;

    Object.keys(form.controls).forEach(name => {
      const control = form.get(name);
      if (!control) return;

      const element = root.querySelector<HTMLElement>(
        '[formControlName="' + name + '"]'
      );
      if (!element) return;

      const invalidClass = ValidationManager.cssConfig.invalidClass || 'afb-invalid';
      element.classList.toggle(invalidClass, control.invalid);

      if (!generateHtml) {
        return;
      }

      const errorClass = ValidationManager.cssConfig.errorContainerClass || 'afb-auto-error';
      const next = element.nextElementSibling as HTMLElement | null;
      if (next && next.classList.contains(errorClass)) {
        this.renderer.removeChild(element.parentElement, next);
      }

      const html = ValidationManager.buildGlobalTemplate({
        control,
        element,
        controlKey: name
      });

      if (!html) {
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      const node = wrapper.firstElementChild as HTMLElement | null;
      if (!node) return;

      node.classList.add(errorClass);
      this.renderer.insertBefore(
        element.parentElement,
        node,
        element.nextSibling
      );
    });
  }
}

@Directive({
  selector: '[ForFormArray]'
})
export class ForFormArrayDirective implements OnDestroy {
  private path: string | null = null;
  private formArray: FormArray | null = null;
  private sub: any;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<ForFormArrayContext>,
    private formGroupDirective: FormGroupDirective
  ) {}

  @Input()
  set ForFormArray(path: string | null | undefined) {
    this.path = path || null;
    this.setup();
  }

  private setup(): void {
    if (!this.formGroupDirective || !this.formGroupDirective.control || !this.path) {
      this.formArray = null;
      this.viewContainer.clear();
      return;
    }

    const control = this.formGroupDirective.control.get(this.path);
    this.formArray = control instanceof FormArray ? control : null;

    if (this.sub && typeof this.sub.unsubscribe === 'function') {
      this.sub.unsubscribe();
    }

    if (!this.formArray) {
      this.viewContainer.clear();
      return;
    }

    this.sub = this.formArray.valueChanges.subscribe(() => this.render());
    this.render();
  }

  private render(): void {
    this.viewContainer.clear();
    if (!this.formArray) return;

    const controls = this.formArray.controls;
    const count = controls.length;

    for (let i = 0; i < count; i++) {
      const context = new ForFormArrayContext(controls[i], i, count);
      this.viewContainer.createEmbeddedView(this.templateRef, context);
    }
  }

  ngOnDestroy(): void {
    if (this.sub && typeof this.sub.unsubscribe === 'function') {
      this.sub.unsubscribe();
    }
  }
}

export class ForFormArrayContext {
  constructor(
    public $implicit: AbstractControl,
    public index: number,
    public count: number
  ) {}

  get first(): boolean {
    return this.index === 0;
  }

  get last(): boolean {
    return this.index === this.count - 1;
  }

  get even(): boolean {
    return this.index % 2 === 0;
  }

  get odd(): boolean {
    return !this.even;
  }
}
`;
  }
}
