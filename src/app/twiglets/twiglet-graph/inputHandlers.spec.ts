import { DebugElement, Pipe } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { D3, D3Service } from 'd3-ng2-service';
import { Map } from 'immutable';
import { Observable } from 'rxjs/Observable';

import { D3Node, Link } from '../../../non-angular/interfaces';
import { EditLinkModalComponent } from './../edit-link-modal/edit-link-modal.component';
import { EditNodeModalComponent } from './../edit-node-modal/edit-node-modal.component';
import { LoadingSpinnerComponent } from './../../shared/loading-spinner/loading-spinner.component';
import { StateService } from '../../state.service';
import { stateServiceStub } from '../../../non-angular/testHelpers';
import { TwigletGraphComponent } from './twiglet-graph.component';
import { UserState } from './../../../non-angular/interfaces/userState/index';
import { clickLink, dblClickNode, dragEnded, dragged, dragStarted, mouseDownOnNode, mouseMoveOnCanvas,
    mouseUpOnCanvas, mouseUpOnNode, nodeClicked } from './inputHandlers';

describe('TwigletGraphComponent:inputHandlers', () => {
  let component: TwigletGraphComponent;
  let fixture: ComponentFixture<TwigletGraphComponent>;
  let compiled;
  let response: UserState;
  const stateServiceStubbed = stateServiceStub();
  const testNode = {
    attrs: [],
    id: 'secondNode',
    name: 'secondNodeName',
    radius: 10,
    type: 'ent2',
    x: 200,
    y: 300,
  } as D3Node;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwigletGraphComponent, LoadingSpinnerComponent ],
      imports: [NgbModule.forRoot()],
      providers: [
        D3Service,
        NgbModal,
        { provide: ActivatedRoute, useValue: { params: Observable.of({name: 'name1'}) } },
        { provide: StateService, useValue: stateServiceStubbed } ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwigletGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.debugElement.nativeElement;
    response = {
      currentNode: null,
      filters: {
        attributes: [],
        types: {},
      },
      isEditing: true,
      linkType: 'line',
    };
  });

  describe('nodeClicked', () => {
    it('sets the current node if a node is clicked', () => {
      spyOn(stateServiceStubbed.userState, 'setCurrentNode');
      nodeClicked.bind(component)(testNode);
      expect(stateServiceStubbed.userState.setCurrentNode).toHaveBeenCalled();
    });

    it('toggles collapsibility if node clicked with alt pressed', () => {
      component.altPressed = true;
      fixture.detectChanges();
      spyOn(stateServiceStubbed.userState, 'setCurrentNode');
      nodeClicked.bind(component)(testNode);
      expect(stateServiceStubbed.userState.setCurrentNode).not.toHaveBeenCalled();
    });
  });

  describe('click link', () => {
    it('opens the edit link modal', () => {
      const testLink = {
        association: 'secondLink',
        id: 'secondLink',
        source: 'thirdNode',
        target: 'firstNode',
      } as Link;
      stateServiceStubbed.userState.setEditing(true);
      spyOn(component.modalService, 'open').and.returnValue({
        componentInstance: { id: 'id', twiglet: 'twiglet' }
      });
      clickLink.bind(component)(testLink);
      expect(component.modalService.open).toHaveBeenCalledWith(EditLinkModalComponent);
    });
  });

  describe('double click node', () => {
    it('brings up the edit node modal if the user is editing', () => {
      stateServiceStubbed.userState.setEditing(true);
      spyOn(component.modalService, 'open').and.returnValue({
        componentInstance: { id: 'id', twiglet: Map({}), twigletModel: Map({}) }
      });
      dblClickNode.bind(component)(testNode);
      expect(component.modalService.open).toHaveBeenCalledWith(EditNodeModalComponent);
    });

    it('updates the node is user is not editing', () => {
      stateServiceStubbed.userState.setEditing(false);
      spyOn(stateServiceStubbed.twiglet, 'updateNode');
      dblClickNode.bind(component)(testNode);
      expect(stateServiceStubbed.twiglet.updateNode).toHaveBeenCalled();
    });

    it('sets node.fx and node.fy if they are null', () => {
      stateServiceStubbed.userState.setEditing(false);
      testNode.fx = null;
      testNode.fy = null;
      dblClickNode.bind(component)(testNode);
      expect(testNode.fx).toEqual(testNode.x);
    });
  });

  describe('mouseUpOnCanvas', () => {
    it('clears the current node if there is one', () => {
      spyOn(stateServiceStubbed.userState, 'clearCurrentNode');
      stateServiceStubbed.userState.setCurrentNode('nodeId');
      mouseUpOnCanvas(component)();
      expect(stateServiceStubbed.userState.clearCurrentNode).toHaveBeenCalled();
    });

    it('opens the edit node modal if there is a node type to be added', () => {
      const d3 = component.d3;
      const stubbedD3 = new Proxy({}, {
        get(target, arg) {
          if (arg === 'mouse') {
            return () => [100, 200];
          }
          return d3[arg];
        }
      }) as any as D3;
      component.d3 = stubbedD3;
      spyOn(component.modalService, 'open').and.returnValue({
        componentInstance: { id: 'id', twiglet: Map({}), twigletModel: Map({}) }
      });
      stateServiceStubbed.userState.setNodeTypeToBeAdded('ent1');
      mouseUpOnCanvas(component)();
      expect(component.modalService.open).toHaveBeenCalledWith(EditNodeModalComponent);
    });
  });

  describe('mouseMoveOnCanvas', () => {
    it('sets the attributes for the tempLinkLine', () => {
      component.tempLink = {
        association: 'secondLink',
        id: 'secondLink',
        source: 'secondNode',
        target: '',
      } as Link;
      const d3 = component.d3;
      const stubbedD3 = new Proxy({}, {
        get(target, arg) {
          if (arg === 'mouse') {
            return () => [100, 200];
          }
          return d3[arg];
        }
      }) as any as D3;
      component.d3 = stubbedD3;
      mouseDownOnNode.bind(component)(testNode);
      mouseMoveOnCanvas(component)();
      expect(component.tempLinkLine.attr('x2')).toEqual('100');
    });
  });

  describe('mouseUpOnNode', () => {
    it('adds a link if the source is not the target', () => {
      const firstNode = {
        attrs: [],
        id: 'firstId',
        name: 'secondNodeName',
        radius: 10,
        type: 'ent2',
        x: 200,
        y: 300,
      } as D3Node;
      component.tempLink = {
        association: 'secondLink',
        id: 'secondLink',
        source: 'thirdNode',
        target: '',
      } as Link;
      spyOn(stateServiceStubbed.twiglet, 'addLink');
      mouseDownOnNode.bind(component)(firstNode);
      mouseUpOnNode.bind(component)(testNode);
      expect(stateServiceStubbed.twiglet.addLink).toHaveBeenCalled();
    });
  });

  describe('drag', () => {
    it('sets node fx and fy when drag started', () => {
      dragStarted.bind(component)(testNode);
      expect(testNode.fx).toEqual(testNode.x);
    });

    it('updates the node fx and fy when dragged', () => {
      const d3 = component.d3;
      const stubbedD3 = new Proxy({}, {
        get(target, arg) {
          if (arg === 'event') {
            return {
              x: 250,
              y: 350
            };
          }
          return d3[arg];
        }
      }) as any as D3;
      component.d3 = stubbedD3;
      dragged.bind(component)(testNode);
      expect(testNode.fx).toEqual(250);
    });

    it('updates the node when drag ended', () => {
      testNode.fx = 500;
      testNode.fy = 500;
      testNode.sx = 200;
      testNode.sy = 300;
      spyOn(stateServiceStubbed.twiglet, 'updateNode');
      dragEnded.bind(component)(testNode);
      expect(stateServiceStubbed.twiglet.updateNode).toHaveBeenCalled();
    });
  });
});
