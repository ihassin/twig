/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { D3Service } from 'd3-ng2-service';
import { StateService, StateServiceStub } from '../state.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { fromJS } from 'immutable';
import { clone } from 'ramda';

import { D3Node, Link } from '../../non-angular/interfaces';
import { TwigletGraphComponent } from './twiglet-graph.component';

import {
  dragEnded,
  dragged,
  dragStarted,
  mouseDownOnNode,
  mouseMoveOnCanvas,
  mouseUpOnCanvas,
  mouseUpOnNode,
} from './inputHandlers';

describe('TwigletGraphComponent:inputHandlers', () => {
  let component: TwigletGraphComponent;
  let fixture: ComponentFixture<TwigletGraphComponent>;
  let node: D3Node;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwigletGraphComponent ],
      providers: [ D3Service, { provide: StateService, useValue: new StateServiceStub()} ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TwigletGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    node = component.currentNodesObject['firstNode'];
  }));

  describe('dragStarted', () => {
    it('fixes the current node location', () => {
      dragStarted.bind(component)(node);
      fixture.detectChanges();
      expect(node.fx).toBeCloseTo(node.x);
      expect(node.fy).toBeCloseTo(node.y);
    });

    it('uses the node service to update the node position', (done) => {
      spyOn(component.nodesService, 'updateNode');
      dragStarted.bind(component)(node);
      expect(component.nodesService.updateNode).toHaveBeenCalled();
      done();
    });

    it('restarts the simulation to halfway if the simulation is winding down.', () => {
      component.simulation.alpha(0.2);
      dragStarted.bind(component)(node);
      expect(component.simulation.alpha()).toEqual(0.5);
    });

    it('does not speed up the simulation alpha if it is less than halfway finished.', () => {
      component.simulation.alpha(0.7);
      dragStarted.bind(component)(node);
      expect(component.simulation.alpha()).toEqual(0.7);
    });
  });

  describe('dragged', () => {
    beforeEach(() => {
      // Stubbing out the mouse event.
      component.d3 = { event: { x: 200, y: 300 } } as any;
    });

    it('restarts the simulation to halfway if the simulation is winding down.', () => {
      component.simulation.alpha(0.2);
      dragged.bind(component)(node);
      expect(component.simulation.alpha()).toBeGreaterThanOrEqual(0.5);
    });


    it('does not speed up the simulation alpha if it is less than halfway finished.', () => {
      component.simulation.alpha(0.7);
      dragged.bind(component)(node);
      expect(component.simulation.alpha()).toBeGreaterThan(0.5);
    });

    it ('fixes the node at the current mouse x and y location', () => {
      dragged.bind(component)(node);
      expect(node.fx).toEqual(200);
      expect(node.fy).toEqual(300);
    });

    it('uses the node service to update the node position', (done) => {
      spyOn(component.nodesService, 'updateNode');
      dragged.bind(component)(node);
      expect(component.nodesService.updateNode).toHaveBeenCalled();
      done();
    });
  });

  describe('dragEnded', () => {

    it('restarts the simulation to halfway if the simulation is winding down.', () => {
      component.simulation.alpha(0.2);
      dragEnded.bind(component)(node);
      expect(component.simulation.alpha()).toBeGreaterThanOrEqual(0.5);
    });

    it('does not speed up the simulation alpha if it is less than halfway finished.', () => {
      component.simulation.alpha(0.7);
      dragEnded.bind(component)(node);
      expect(component.simulation.alpha()).toBeGreaterThan(0.5);
    });

    it ('sets the final location of the node and removes the fixed position', () => {
      node.fx = 200;
      node.fy = 300;
      dragEnded.bind(component)(node);
      expect(node.x).toEqual(200);
      expect(node.y).toEqual(300);
      expect(node.fx).toBeFalsy();
      expect(node.fy).toBeFalsy();
    });

    it('uses the node service to update the node position', (done) => {
      spyOn(component.nodesService, 'updateNode');
      dragEnded.bind(component)(node);
      expect(component.nodesService.updateNode).toHaveBeenCalled();
      done();
    });
  });

  describe('mouseDownOnNode', () => {
    it('starts a temp link with the node id', () => {
      mouseDownOnNode.bind(component)(node);
      expect(component.tempLink).toBeTruthy();
      expect(component.tempLink.source).toEqual(node.id);
    });

    it('creates a movable link on the svg', () => {
      mouseDownOnNode.bind(component)(node);
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#temp-draggable-link-line')).toBeTruthy();
    });
  });

  describe('mouseMoveOnCanvas', () => {
    beforeEach(() => {
      // Stubbing out the mouse results.
      component.d3 = { mouse: () => [200, 300] } as any;
      // Adding an existing link to the dom.
      mouseDownOnNode.bind(component)(node);
    });

    it('updates the line so it follows the movements of the mouse', () => {
      mouseMoveOnCanvas(component)();
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const nodeAttributes = compiled.querySelector('#temp-draggable-link-line').attributes as NamedNodeMap;
      expect(+nodeAttributes.getNamedItem('x2').value).toEqual(201);
      expect(+nodeAttributes.getNamedItem('y2').value).toEqual(301);
    });
  });

  describe('mouseUpOnCanvas', () => {
    beforeEach(() => {
      // Adding an existing link to the dom.
      mouseDownOnNode.bind(component)(node);
    });

    it('should clear the tempLink and remove the line drawn when connecting nodes', () => {
      mouseUpOnCanvas(component)();
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#temp-draggable-link-line')).toBeFalsy();
      expect(component.tempLink).toBeFalsy();
    });
  });

  describe('mouseUpOnNode', () => {
    beforeEach(() => {
      // Adding an existing link to the dom.
      mouseDownOnNode.bind(component)(node);
    });

    it('should complete the link and add the link through the link service', () => {
      // Expected values
      const endNode = component.currentNodesObject['secondNode'];
      const finalLink = clone(component.tempLink);
      finalLink.target = endNode.id;

      spyOn(component.linksServices, 'addLink');
      mouseUpOnNode.bind(component)(endNode);
      expect(component.linksServices.addLink).toHaveBeenCalledWith(finalLink);
    });

    it('remove the temp link from dom', () => {
      mouseUpOnNode.bind(component)(node);
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#temp-draggable-link-line')).toBeFalsy();
      expect(component.tempLink).toBeFalsy();
    });
  });
});
