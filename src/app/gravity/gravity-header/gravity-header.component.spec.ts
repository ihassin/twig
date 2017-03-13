import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GravityHeaderComponent } from './gravity-header.component';

describe('GravityHeaderComponent', () => {
  let component: GravityHeaderComponent;
  let fixture: ComponentFixture<GravityHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GravityHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GravityHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
