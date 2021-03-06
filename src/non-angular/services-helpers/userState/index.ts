import { Inject } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Simulation } from 'd3-ng2-service';
import { fromJS, List, Map } from 'immutable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { authSetDataOptions, handleError } from '../httpHelpers';
import { Config } from '../../config';
import { ConnectType, LinkType, Scale, ScaleType } from '../../interfaces';
import { LoadingSpinnerComponent } from './../../../app/shared/loading-spinner/loading-spinner.component';
import { UserState } from './../../interfaces/userState/index';
import { ViewUserState } from './../../interfaces/twiglet/view';

/**
 * Contains all of the informatio and modifiers about the current user state (what buttons clicked,
 * toggles toggled, etc)
 *
 * @export
 * @class UserStateService
 */
export class UserStateService {
  /**
   * The default values for a twiglet
   *
   * @private
   * @type {Map<string, any>}
   * @memberOf UserStateService
   */
  private _defaultState: Map<string, any> = fromJS({
    activeModel: false,
    activeTwiglet: false,
    addingGravityPoints: false,
    autoConnectivity: 'in',
    autoScale: 'linear',
    bidirectionalLinks: true,
    cascadingCollapse: false,
    copiedNodeId: null,
    currentNode: null,
    currentViewName: null,
    editTwigletModel: false,
    filters: Map({}),
    forceChargeStrength: 0.1,
    forceGravityX: 0.1,
    forceGravityY: 0.1,
    forceLinkDistance: 20,
    forceLinkStrength: 0.5,
    forceVelocityDecay: 0.9,
    formValid: true,
    gravityPoints: Map({}),
    highlightedNode: '',
    isEditing: false,
    isEditingGravity: false,
    linkType: 'path',
    mode: 'home',
    nodeSizingAutomatic: true,
    nodeTypeToBeAdded: null,
    ping: null,
    scale: 3,
    showLinkLabels: false,
    showNodeLabels: false,
    textToFilterOn: null,
    traverseDepth: 3,
    treeMode: false,
    user: null,
  });
  /**
   * The actual item being observed, modified. Private to maintain immutability.
   *
   * @private
   * @type {BehaviorSubject<Map<string, any>>}
   * @memberOf UserStateService
   */
  private _userState: BehaviorSubject<Map<string, any>> =
    new BehaviorSubject(this._defaultState);

  private _intervalCounterId: any = 0;
  public interval = 500; // in milliseconds
  private _spinnerVisible = true;
  public modelRef;

  constructor(private http: Http, private router: Router, public modalService: NgbModal) {
    this.router.events.subscribe(event => {
      if (event.url.startsWith('/model')) {
        this.setMode('model');
      } else if (event.url.startsWith('/twiglet')) {
        if (event.url.endsWith('model')) {
          this.setMode('twiglet.model');
        } else {
          this.setMode('twiglet');
        }
      } else {
        this.setMode('home');
      }
    });
    const url = `${Config.apiUrl}/ping`;
    this.http.get(url, authSetDataOptions)
    .map((res: Response) => res.json())
    .subscribe(response => {
      this._userState.next(this._userState.getValue().set('ping', response));
      if (response.authenticated) {
        this._userState.next(this._userState.getValue().set('user', response.authenticated));
      }
    });
  }


  /**
   * Returns an observable, because BehaviorSubject is used, first time subscribers get the current state.
   *
   * @readonly
   * @type {Observable<Map<string, any>>}
   * @memberOf UserStateService
   */
  get observable(): Observable<Map<string, any>> {
    return this._userState.asObservable();
  }

  /**
   * Resets everything to the default state.
   *
   *
   * @memberOf UserStateService
   */
  resetAllDefaults() {
    const doNotReset = {
      activeModel: true,
      activeTwiglet: true,
      addingGravityPoints: true,
      copiedNodeId: true,
      currentNode: true,
      currentViewName: true,
      editTwigletModel: true,
      formValid: true,
      highlightedNode: true,
      isEditing: true,
      isEditingGravity: true,
      mode: true,
      nodeTypeToBeAdded: true,
      ping: true,
      textToFilterOn: true,
      user: true,
    };
    let currentState = this._userState.getValue();
    currentState.keySeq().forEach(key => {
      if (!doNotReset[key]) {
        currentState = currentState.set(key, this._defaultState.get(key));
      }
    });
    this._userState.next(currentState);
  }

  /**
   * Logs a user into the api.
   *
   * @param {any} body
   * @returns
   *
   * @memberOf UserStateService
   */
  logIn(body) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers, withCredentials: true });
    const url = `${Config.apiUrl}/login`;
    return this.http.post(url, body, options).map((res: Response) => res.json())
      .catch((error) => {
        handleError(error);
        return Observable.throw(error);
      });
  }

  /**
   * Logs the user out of the api.
   *
   *
   * @memberOf UserStateService
   */
  logOut() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers, withCredentials: true });
    const url = `${Config.apiUrl}/logout`;

    this.http.post(url, options).map((res: Response) => {
      return res.json();
    }).subscribe(response => {
      this._userState.next(this._userState.getValue().set('user', null));
    });
  }

  /**
   * Takes a userState (view) and loads it into the current state.
   *
   * @param {ViewUserState} userState
   * @returns
   *
   * @memberOf UserStateService
   */
  loadUserState(userState: ViewUserState) {
    let currentState = this._userState.getValue().asMutable();
    Reflect.ownKeys(userState).forEach(key => {
      currentState = currentState.set(key as string, fromJS(userState[key]));
    });
    this._userState.next(currentState.asImmutable());
    return Observable.of(userState);
  }

  /**
   * Sets the current user (usually called via login and not via user actions.)
   *
   * @param {any} email
   *
   * @memberOf UserStateService
   */
  setCurrentUser(email) {
    this._userState.next(this._userState.getValue().set('user', email));
  }


  /**
   * Sets the autoconnectivity type, supported values are "in", "out" and "both"
   *
   * @param {string} connectType
   *
   * @memberOf UserStateService
   */
  setAutoConnectivity(connectType: ConnectType) {
    this._userState.next(this._userState.getValue().set('autoConnectivity', connectType));
  }

  /**
   * Sets the auto scale, supported values are "linear", "sqrt" and "power"
   *
   * @param {ScaleType} scaleType
   *
   * @memberOf UserStateService
   */
  setAutoScale(scaleType: ScaleType) {
    this._userState.next(this._userState.getValue().set('autoScale', scaleType));
  }

  /**
   * turns bidirectional links on (true) or off (false)
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setBidirectionalLinks(bool: boolean) {
    this._userState.next(this._userState.getValue().set('bidirectionalLinks', bool));
  }

  /**
   * Turns cascading collapse on and off.
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setCascadingCollapse(bool: boolean) {
    this._userState.next(this._userState.getValue().set('cascadingCollapse', bool));
  }

  /**
   * Sets the current node selected by the user.
   *
   * @param {string} id string id of the node
   *
   * @memberOf UserStateService
   */
  setCurrentNode(id: string) {
    this._userState.next(this._userState.getValue().set('currentNode', id));
  }

  /**
   * Copies the currently selected node
   *
   *
   * @memberOf UserStateService
   */
  setCopiedNodeId() {
    const userState = this._userState.getValue();
    this._userState.next(userState.set('copiedNodeId', userState.get('currentNode')));
  }

  /**
   * Removes a current node selected by the user (if any)
   *
   *
   * @memberOf UserStateService
   */
  clearCurrentNode() {
    this._userState.next(this._userState.getValue().set('currentNode', ''));
  }

  /**
   * Sets the current twiglet selected by the user.
   *
   * @param {string} name string name of the view
   *
   * @memberOf UserStateService
   */
  setCurrentView(name: string) {
    this._userState.next(this._userState.getValue().set('currentViewName', name));
  }

  /**
   * Clears the current View to null.
   *
   *
   * @memberOf UserStateService
   */
  clearCurrentView() {
    this._userState.next(this._userState.getValue().set('currentViewName', null));
  }

  /**
   * Sets the charge strength of the Simulation.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceChargeStrength(number: number) {
    this._userState.next(this._userState.getValue().set('forceChargeStrength', number));
  }

  /**
   * Sets the gravity along the x-axis.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceGravityX(number: number) {
    this._userState.next(this._userState.getValue().set('forceGravityX', number));
  }

  /**
   * Sets the gravity along the y-axis.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceGravityY(number: number) {
    this._userState.next(this._userState.getValue().set('forceGravityY', number));
  }

  /**
   * Sets the distance between links on the force graph.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceLinkDistance(number: number) {
    this._userState.next(this._userState.getValue().set('forceLinkDistance', number));
  }

  /**
   * Sets the strength between links on the force graph.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceLinkStrength(number: number) {
    this._userState.next(this._userState.getValue().set('forceLinkStrength', number));
  }

  /**
   * Sets the strength between links on the force graph.
   *
   * @param {number} number
   *
   * @memberOf UserStateService
   */
  setForceVelocityDecay(number: number) {
    this._userState.next(this._userState.getValue().set('forceVelocityDecay', number));
  }

  /**
   * Sets edit mode to true or false
   *
   * @param {boolean} bool desired edit mode.
   *
   * @memberOf UserStateService
   */
  setEditing(bool: boolean) {
    this._userState.next(this._userState.getValue().set('isEditing', bool));
  }

  /**
   * Sets edit gravity mode to true or false
   *
   * @param {boolean} bool desired edit mode.
   *
   * @memberOf UserStateService
   */
  setGravityEditing(bool: boolean) {
    this._userState.next(this._userState.getValue().set('isEditingGravity', bool));
  }

  /**
   * Sets adding gravity points state (to trigger correct click events) to true or false
   *
   * @param {boolean} bool desired edit mode.
   *
   * @memberOf UserStateService
   */
  setAddGravityPoints(bool: boolean) {
    this._userState.next(this._userState.getValue().set('addingGravityPoints', bool));
  }

  /**
   * Sets the link type, supported values are "path" (curves) and "line" (straight)
   *
   * @param {LinkType} linkType
   *
   * @memberOf UserStateService
   */
  setLinkType(linkType: LinkType) {
    this._userState.next(this._userState.getValue().set('linkType', linkType));
  }

  /**
   * Turns automatic node sizing on (true) and off (false)
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setNodeSizingAutomatic(bool: boolean) {
    this._userState.next(this._userState.getValue().set('nodeSizingAutomatic', bool));
  }

  /**
   * Sets the current node type to be added to the twiglet by dragging.
   *
   * @param {string} type the type of node to be added to the twiglet.
   *
   * @memberOf UserStateService
   */
  setNodeTypeToBeAdded(type: string) {
    this._userState.next(this._userState.getValue().set('nodeTypeToBeAdded', type));
  }

  /**
   * Sets the mode (twiglet, model, etc)
   *
   * @param {string} mode
   *
   * @memberOf UserStateService
   */
  setMode(mode: string) {
    this._userState.next(this._userState.getValue().set('mode', mode));
  }

  /**
   * Sets the filters
   *
   * @param {Object} filters
   *
   * @memberOf UserStateService
   */
  setFilter(filters: Object) {
    this._userState.next(this._userState.getValue().set('filters', fromJS(filters)));
  }

  /**
   * Sets the scale of the nodes
   *
   * @param {number} scale
   *
   * @memberOf UserStateService
   */
  setScale(scale: Scale) {
    this._userState.next(this._userState.getValue().set('scale', scale));
  }

  /**
   * Sets showing of node labels on svg.
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setShowNodeLabels() {
    const current = this._userState.getValue().get('showNodeLabels');
    this._userState.next(this._userState.getValue().set('showNodeLabels', !current));
  }

  /**
   * Toggles the display of node names.
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setShowLinkLabels() {
    const current = this._userState.getValue().get('showLinkLabels');
    this._userState.next(this._userState.getValue().set('showLinkLabels', !current));
  }

  /**
   * Sets the current node type to be added to the twiglet by dragging.
   *
   * @param {string} type the type of node to be added to the twiglet.
   *
   * @memberOf UserStateService
   */
  setTextToFilterOn(text: string) {
    this._userState.next(this._userState.getValue().set('textToFilterOn', text));
  }

  /**
   * Turns treeMode on (true) or off (false)
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setTreeMode(bool: boolean) {
    this._userState.next(this._userState.getValue().set('treeMode', bool));
  }

  /**
   * Sets the whether a form is valid or invalid.
   *
   * @param {boolean} bool
   *
   * @memberOf UserStateService
   */
  setFormValid(bool: boolean) {
    this._userState.next(this._userState.getValue().set('formValid', bool));
  }

  /**
   * sets the highlighted node
   *
   * @param {string} id
   *
   * @memberOf UserStateService
   */
  setHighLightedNode(id: string) {
    const userState = this._userState.getValue();
    if (userState.get('highlightedNode') !== id) {
      this._userState.next(userState.set('highlightedNode', id));
    }
  }

  setTwigletModelEditing(bool: boolean) {
    this._userState.next(this._userState.getValue().set('editTwigletModel', bool));
  }

  startSpinner() {
    this.modelRef = this.modalService.open(LoadingSpinnerComponent, { windowClass: 'modalTop', size: 'sm', backdrop: 'static'});
  }

  stopSpinner() {
    this.modelRef.close();
  }
}
