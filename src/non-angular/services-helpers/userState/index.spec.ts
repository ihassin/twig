import { TestBed, async, inject } from '@angular/core/testing';
import { BaseRequestOptions, Http, HttpModule, Response, RequestMethod, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Map } from 'immutable';
import { UserState } from './../../interfaces/userState/index';
import { UserStateService } from './index';
import { router } from '../../testHelpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingSpinnerComponent } from './../../../app/shared/loading-spinner/loading-spinner.component';

describe('UserStateService', () => {
  const mockUserResponse = {
    user: {
      email: 'user@email.com',
      name: 'user@email.com'
    }
  };
  let mockBackend;
  let userStateService: UserStateService;

  beforeEach(() => {
    mockBackend = new MockBackend();
    userStateService = new UserStateService(new Http(mockBackend, new BaseRequestOptions()), router() as any, null);
  });

  describe('Observables', () => {
    it('returns an observable with the default values on subscription', () => {
      userStateService.observable.subscribe(response => {
        expect(response.get('currentNode')).toBeFalsy();
        expect(response.get('isEditing')).toBeFalsy();
      });
    });
  });

  describe('currentNode', () => {
    it('can set the current node', () => {
      userStateService.setCurrentNode('node id');
      userStateService.observable.subscribe(response => {
        expect(response.get('currentNode')).toEqual('node id');
      });
    });

    it('can set the copied node id to the current node id', () => {
      userStateService.setCurrentNode('node id');
      userStateService.setCopiedNodeId();
      userStateService.observable.subscribe(response => {
        expect(response.get('copiedNodeId')).toEqual('node id');
      });
    });

    it('can clear the current node', () => {
      // setup
      userStateService.setCurrentNode('node id');

      userStateService.clearCurrentNode();
      userStateService.observable.subscribe(response => {
        expect(response.get('currentNode')).toBeFalsy();
      });
    });
  });

  describe('currentViewName', () => {
    it('can set the current View', () => {
      userStateService.setCurrentView('View name');
      userStateService.observable.subscribe(response => {
        expect(response.get('currentViewName')).toEqual('View name');
      });
    });

    it('can clear the current View', () => {
      userStateService.setCurrentView('View name');

      userStateService.clearCurrentView();
      userStateService.observable.subscribe(response => {
        expect(response.get('currentViewName')).toBeFalsy();
      });
    });
  });

  describe('isEditing', () => {
    it('can set the editing mode to a boolean', () => {
      userStateService.setEditing(true);
      userStateService.observable.subscribe(response => {
        expect(response.get('isEditing')).toEqual(true);
      });
    });
  });

  describe('nodeTypeToBeAdded', () => {
    it('can set the current node type to be added', () => {
      userStateService.setNodeTypeToBeAdded('a type');
      userStateService.observable.subscribe(response => {
        expect(response.get('nodeTypeToBeAdded')).toEqual('a type');
      });
    });

    it('can clear the node type so nothing is added', () => {
      userStateService.clearNodeTypeToBeAdded();
      userStateService.observable.subscribe(response => {
        expect(response.get('nodeTypeToBeAdded')).toBeFalsy();
      });
    });
  });

  describe('showNodeLabels', () => {
    it('can set the node labels to a boolean', () => {
      userStateService.setShowNodeLabels(true);
      userStateService.observable.subscribe(response => {
        expect(response.get('showNodeLabels')).toEqual(true);
      });
    });
  });

  describe('showLinkLabels', () => {
    it('can set the link labels to a boolean', () => {
      userStateService.setShowLinkLabels(true);
      userStateService.observable.subscribe(response => {
        expect(response.get('showLinkLabels')).toEqual(true);
      });
    });
  });

  describe('textToFilterOn', () => {
    it('can set the search text', () => {
      userStateService.setTextToFilterOn('search term');
      userStateService.observable.subscribe(response => {
        expect(response.get('textToFilterOn')).toEqual('search term');
      });
    });
  });

  describe('sortNodesBy', () => {
    it('can set the key that nodes are being sorted on', () => {
      userStateService.setSortNodesBy('a string');
      userStateService.observable.subscribe(response => {
        expect(response.get('sortNodesBy')).toEqual('a string');
      });
    });
  });

  describe('logIn', () => {
    it('can set the current user', (done) => {
      userStateService.setCurrentUser('user@email.com');
      userStateService.observable.subscribe(response => {
        expect(response.get('user')).toEqual('user@email.com');
        done();
      });
    });

    it('can log the user in', (done) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockUserResponse)
        })));
        expect(connection.request.method).toEqual(RequestMethod.Post);
      });
      return userStateService.logIn({ email: 'user@email.com', password: 'password'})
      .subscribe(response => {
        expect(response).toEqual(mockUserResponse);
        done();
      });
    });
  });
});
