/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FilterMenuComponent } from './filter-menu.component';
import { StateService } from '../state.service';
import { stateServiceStub } from '../../non-angular/testHelpers';

describe('FilterMenuComponent', () => {
  let component: FilterMenuComponent;
  let fixture: ComponentFixture<FilterMenuComponent>;
  const stateServiceStubbed = stateServiceStub();
  stateServiceStubbed.twiglet.loadTwiglet('id1');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterMenuComponent ],
      imports: [NgbModule.forRoot()],
      providers: [ { provide: StateService, useValue: stateServiceStubbed } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the entities from the model', () => {
    const entities = fixture.nativeElement.querySelectorAll('.dropdown-entity');
    expect(entities.length).toEqual(5);
  });

  it('sets the entity to be filtered to selected entity', () => {
    spyOn(stateServiceStubbed.userState, 'setFilterEntities');
    fixture.nativeElement.querySelector('.dropdown-entity').click();
    expect(stateServiceStubbed.userState.setFilterEntities).toHaveBeenCalledWith(['ent1']);
    fixture.nativeElement.querySelector('.dropdown-entity').click();
  });

  it('when all is clicked, empties filtered entities array to display all types', () => {
    spyOn(stateServiceStubbed.userState, 'setFilterEntities');
    fixture.nativeElement.querySelector('.dropdown-entity').click();
    expect(component.userState.filterEntities.length).toEqual(1);
    fixture.nativeElement.querySelector('.dropdown-item').click();
    expect(stateServiceStubbed.userState.setFilterEntities).toHaveBeenCalledWith([]);
    expect(component.userState.filterEntities.length).toEqual(0);
  });
});
