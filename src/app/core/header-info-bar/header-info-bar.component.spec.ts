import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';

import { HeaderInfoBarComponent } from './header-info-bar.component';
import { LoginButtonComponent } from './../login-button/login-button.component';
import { PingComponent } from './../ping/ping.component';
import { routerForTesting } from './../../app.router';
import { StateService } from '../../state.service';
import { stateServiceStub } from '../../../non-angular/testHelpers';

describe('HeaderInfoBarComponent', () => {
  let component: HeaderInfoBarComponent;
  let fixture: ComponentFixture<HeaderInfoBarComponent>;
  const stateServiceStubbed = stateServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderInfoBarComponent, LoginButtonComponent ],
      imports: [ NgbModule.forRoot() ],
      providers: [
        NgbModal,
        { provide: StateService, useValue: stateServiceStubbed },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderInfoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clicking the home button goes to the home page', () => {
    fixture.nativeElement.querySelector('.fa-home').click();
    expect(component.router.navigate).toHaveBeenCalled();
  });

  it('clicking the info button brings up the about modal', () => {
    spyOn(component.modalService, 'open').and.returnValue({ componentInstance: { setup: () => {} } });
    fixture.nativeElement.querySelector('.fa-info').click();
    expect(component.modalService.open).toHaveBeenCalledWith(PingComponent);
  });
});
