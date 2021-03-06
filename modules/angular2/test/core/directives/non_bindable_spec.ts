import {
  AsyncTestCompleter,
  TestComponentBuilder,
  By,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {Component, Directive, View} from 'angular2/angular2';

import {ElementRef} from 'angular2/src/core/compiler/element_ref';

import {NgNonBindable} from 'angular2/src/core/directives/ng_non_bindable';

export function main() {
  describe('non-bindable', () => {
    it('should not interpolate children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div>{{text}}<span ng-non-bindable>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('foo{{text}}');
               async.done();
             });
       }));

    it('should ignore directives on child nodes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div ng-non-bindable><span id=child test-dec>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();

               // We must use DOM.querySelector instead of rootTC.query here
               // since the elements inside are not compiled.
               var span = DOM.querySelector(rootTC.nativeElement, '#child');
               expect(DOM.hasClass(span, 'compiled')).toBeFalsy();
               async.done();
             });
       }));

    it('should trigger directives on the same node',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div><span id=child ng-non-bindable test-dec>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               var span = DOM.querySelector(rootTC.nativeElement, '#child');
               expect(DOM.hasClass(span, 'compiled')).toBeTruthy();
               async.done();
             });
       }));
  })
}

@Directive({selector: '[test-dec]'})
class TestDirective {
  constructor(el: ElementRef) { DOM.addClass(el.nativeElement, 'compiled'); }
}

@Component({selector: 'test-cmp'})
@View({directives: [NgNonBindable, TestDirective]})
class TestComponent {
  text: string;
  constructor() { this.text = 'foo'; }
}
