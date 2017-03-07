import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { D3, Selection } from 'd3-ng2-service';
import { UUID } from 'angular2-uuid';
import { D3DragEvent } from 'd3-ng2-service';

import { TwigletGraphComponent } from './twiglet-graph.component';
import { D3Node, Link } from '../../non-angular/interfaces';
import { EditNodeModalComponent } from '../edit-node-modal/edit-node-modal.component';
import { EditLinkModalComponent } from '../edit-link-modal/edit-link-modal.component';
import { toggleNodeCollapsibility } from './collapseAndFlowerNodes';


/**
 * Starts the dragging process on a node by fixing the node's location.
 *
 * @export
 * @param {D3Node} node
 */
export function dragStarted (this: TwigletGraphComponent, node: D3Node) {
  if (!this.altPressed) {
    node.fx = node.x;
    node.fy = node.y;
    // this.stateService.twiglet.updateNode(node, this.currentNodeState);
    if (this.simulation.alpha() < 0.5) {
      this.simulation.alpha(0.5).restart();
    }
  }
}

/**
 * Moves a node around by settings the node fixed x and y to the mouse x and y.
 *
 * @export
 * @param {D3Node} node
 */
export function dragged(this: TwigletGraphComponent, node: D3Node) {
  const e: D3DragEvent<SVGTextElement, D3Node, D3Node> = this.d3.event;
  if (this.simulation.alpha() < 0.5) {
    this.simulation.alpha(0.5).restart();
  }
  node.fx = e.x;
  node.fy = e.y;
}

/**
 * Ends the drag process by removing the fixing on a node so D3 can take controll of it's position.
 *
 * @export
 * @param {D3Node} node
 */
export function dragEnded(this: TwigletGraphComponent, node: D3Node) {
  if (this.simulation.alpha() < 0.5) {
    this.simulation.alpha(0.5).restart();
  }
  this.stateService.twiglet.updateNode(node, this.currentTwigletState);
}

export function nodeClicked(this: TwigletGraphComponent, node: D3Node) {
  if (this.altPressed) {
    toggleNodeCollapsibility.bind(this)(node);
  } else {
    this.stateService.userState.setCurrentNode(node.id);
  }
}

/**
 * When the user presses down on a node, this starts the linking process by creating a line and
 * a temp node.
 *
 * @export
 * @param {D3Node} node
 */
export function mouseDownOnNode(this: TwigletGraphComponent, node: D3Node) {
  this.tempLink = {
    id: UUID.UUID(),
    source: node.id,
    target: null,
  };
  this.tempLinkLine = this.d3Svg.append<SVGLineElement>('line')
  .attr('id', 'temp-draggable-link-line')
  .attr('x1', node.x)
  .attr('y1', node.y)
  .attr('x2', node.x)
  .attr('y2', node.y)
  .attr('style', 'stroke:rgb(255,0,0);stroke-width:2');
}

/**
 * Tracks movement on a canvas but only if there is a link waiting to be completed.
 *
 * @export
 * @param {TwigletGraphComponent} parent
 * @returns {() => void}
 */
export function mouseMoveOnCanvas(parent: TwigletGraphComponent): () => void {
  return function () {
    if (parent.tempLink) {
      const mouse = parent.d3.mouse(this);
      // Add one so the line doesn't capture the mouse clicks and ups.
      parent.tempLinkLine.attr('x2', mouse[0] + 1).attr('y2', mouse[1] + 1);
    }
  };
}

/**
 * This clears everything because the user mouse'd up but NOT on a node. That is, unless
 * the user is in the process of adding a new node.
 *
 * @export
 * @param {TwigletGraphComponent} parent
 * @returns {() => void}
 */
export function mouseUpOnCanvas(parent: TwigletGraphComponent): () => void {
  return function () {
    if (parent.tempLink) {
      parent.tempLink = null;
      parent.tempLinkLine.remove();
      parent.tempLinkLine = null;
    } else if (parent.userState.get('nodeTypeToBeAdded')) {
      const mouse = parent.d3.mouse(this);
      const node: D3Node = {
        attrs: [],
        id: UUID.UUID(),
        type: parent.userState.get('nodeTypeToBeAdded'),
        x: mouse[0],
        y: mouse[1],
      };
      parent.stateService.twiglet.addNode(node);
      parent.stateService.userState.setCurrentNode(node.id);
      const modelRef = parent.modalService.open(EditNodeModalComponent);
      const component = <EditNodeModalComponent>modelRef.componentInstance;
      component.id = node.id;
      component.twiglet = parent.twiglet;
      component.twigletModel = parent.modelMap;
    } else if (parent.userState.get('currentNode')) {
      parent.stateService.userState.clearCurrentNode();
    }
  };
}

/**
 * When the user completes a link by mouse-upping on a node, This completes that link, calls
 * addLink on the service and then removes the temp link.
 *
 * @export
 * @param {D3Node} node
 */
export function mouseUpOnNode(this: TwigletGraphComponent, node: D3Node) {
  if (this.tempLink && this.tempLink.source !== node.id) {
    this.tempLink.target = node.id;
    this.stateService.twiglet.addLink(this.tempLink);
    this.updateLinkLocation();
    mouseUpOnCanvas(this)();
    this.updateCircleLocation();
  }
}

export function dblClickNode(this: TwigletGraphComponent, node: D3Node) {
  if (this.userState.get('isEditing')) {
    const modelRef = this.modalService.open(EditNodeModalComponent);
    const component = <EditNodeModalComponent>modelRef.componentInstance;
    component.id = node.id;
    component.twiglet = this.twiglet;
    component.twigletModel = this.modelMap;
  } else {
    if (node.fx !== null) {
      node.fx = null;
    } else {
      node.fx = node.x;
    }
    if (node.fy !== null) {
      node.fy = null;
    } else {
      node.fy = node.x;
    }
    this.stateService.twiglet.updateNode(node);
  }
}

export function clickLink(this: TwigletGraphComponent, link: Link) {
  if (this.userState.get('isEditing')) {
    const modelRef = this.modalService.open(EditLinkModalComponent);
    const component = <EditLinkModalComponent>modelRef.componentInstance;
    component.id = link.id;
    component.twiglet = this.twiglet;
  }
}
