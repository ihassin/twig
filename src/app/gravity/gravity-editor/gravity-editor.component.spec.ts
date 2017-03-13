import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GravityEditorComponent } from './gravity-editor.component';

describe('GravityEditorComponent', () => {
  let component: GravityEditorComponent;
  let fixture: ComponentFixture<GravityEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GravityEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GravityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
