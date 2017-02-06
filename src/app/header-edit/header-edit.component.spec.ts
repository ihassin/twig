import { Map } from 'immutable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditTwigletDetailsComponent } from './../edit-twiglet-details/edit-twiglet-details.component';
import { TwigletEditButtonComponent } from './../twiglet-edit-button/twiglet-edit-button.component';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NgbModal, NgbModule, NgbTooltipModule, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

import { CopyPasteNodeComponent } from '../copy-paste-node/copy-paste-node.component';
import { FontAwesomeToggleButtonComponent } from '../font-awesome-toggle-button/font-awesome-toggle-button.component';
import { AddNodeByDraggingButtonComponent } from '../add-node-by-dragging-button/add-node-by-dragging-button.component';
import { KeyValuesPipe } from '../key-values.pipe';
import { StateService } from '../state.service';
import { stateServiceStub, fullTwigletModelMap, fullTwigletMap, twigletsList } from '../../non-angular/testHelpers';
import { HeaderEditComponent } from './header-edit.component';

describe('HeaderEditComponent', () => {
  let component: HeaderEditComponent;
  let fixture: ComponentFixture<HeaderEditComponent>;
  const stateServiceStubbed = stateServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddNodeByDraggingButtonComponent,
        CopyPasteNodeComponent,
        EditTwigletDetailsComponent,
        FontAwesomeToggleButtonComponent,
        HeaderEditComponent,
        KeyValuesPipe,
        TwigletEditButtonComponent,
      ],
      imports: [ NgbTooltipModule, NgbModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [ NgbTooltipConfig, NgbModal, { provide: StateService, useValue: stateServiceStubbed } ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderEditComponent);
    component = fixture.componentInstance;
    component.userState = Map({
      isEditing: true,
    });
    component.twiglet = fullTwigletMap();
    component.twigletModel = fullTwigletModelMap();
    component.twiglets = twigletsList();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the correct number of icons in edit mode', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('app-add-node-by-dragging-button').length).toEqual(5);
  });
});
