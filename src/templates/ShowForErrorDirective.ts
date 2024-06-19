export class showForErrorDirective {
    static getTemplate() {
        return `
import { Directive, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { FormGroupDirective, FormControl } from '@angular/forms';
import { ErrorTypes } from './ValidationManager';

@Directive({
  selector: '[showForError]'
})
export class ShowForErrorDirective implements OnInit, OnDestroy {
  @Input('showForError') errorType: keyof typeof ErrorTypes = 'Required';
  private formGroupDirective: FormGroupDirective | null = null;
  private nativeElement: HTMLElement;
  private unsubscribe: any;

  constructor(private el: ElementRef, private renderer: Renderer2, private fg: FormGroupDirective) {
    this.nativeElement = el.nativeElement;
    this.formGroupDirective = fg;
    this.unsubscribe = () => {};
  }

  ngOnInit(): void {
    if (!this.formGroupDirective) {
      throw new Error('showForError directive must be used within a form with [formGroup] or formGroupDirective');
    }

    this.unsubscribe = this.formGroupDirective.ngSubmit.subscribe(() => {
      this.checkError();
    });

    this.formGroupDirective?.valueChanges?.subscribe(() => {
      this.checkError();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private checkError(): void {
    if (!this.formGroupDirective || !this.formControl) {
      this.renderer.setStyle(this.nativeElement, 'display', 'none');
      return;
    }

    const control = this.formControl;
    if (control && control.errors && control.errors[ErrorTypes[this.errorType]]) {
      this.renderer.setStyle(this.nativeElement, 'display', 'block');
    } else {
      this.renderer.setStyle(this.nativeElement, 'display', 'none');
    }
  }

  private get formControl(): FormControl | null {
    return this.formGroupDirective ? this.formGroupDirective.control.get(this.nativeElement!.getAttribute('formControlName')!) as FormControl : null;
  }
}
        `;
    }
}