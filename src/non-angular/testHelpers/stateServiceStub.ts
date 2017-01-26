import { successfulMockBackend } from './mockBackEnd';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BaseRequestOptions, Http, } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockBackend } from '@angular/http/testing';
import { StateService } from '../../app/state.service';

export function stateServiceStub(mockBackend: MockBackend = successfulMockBackend) {
  const http = new Http(mockBackend, new BaseRequestOptions());
  return new StateService(http, null, null);
};
