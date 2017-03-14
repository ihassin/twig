import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Simulation } from 'd3-ng2-service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { fromJS, Map, List } from 'immutable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConnectType, ScaleType, LinkType, Scale } from '../../interfaces';
import { Config } from '../../config';
import { LoadingSpinnerComponent } from './../../../app/shared/loading-spinner/loading-spinner.component';
import { UserState } from './../../interfaces/userState/index';

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
    autoConnectivity: 'in',
    autoScale: 'linear',
    bidirectionalLinks: true,
    cascadingCollapse: true,
    copiedNodeId: null,
    currentNode: null,
    currentViewName: null,
    editTwigletModel: false,
    filters: Map({
      attributes: List([]),
      types: Map({}),
    }),
    forceChargeStrength: 0.1,
    forceGravityX: 0.0,
    forceGravityY: 0.0,
    forceLinkDistance: 20,
    forceLinkStrength: 0.5,
    forceVelocityDecay: 0.9,
    formValid: true,
    gravityPoints: {},
    isEditing: false,
    linkType: 'path',
    mode: 'home',
    nodeSizingAutomatic: true,
    nodeTypeToBeAdded: null,
    scale: 3,
    showLinkLabels: false,
    showNodeLabels: false,
    textToFilterOn: null,
    traverseDepth: 3,
    treeMode: false,
    user: null
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
   * Clears the filters
   *
   *
   * @memberOf UserStateService
   */
  clearFilters() {
    this._userState.next(this._userState.getValue().set('filters', fromJS({
      attributes: List([]),
      types: Map({}),
    })));
    this.stopSpinner();
    return Observable.of(this._userState.getValue());
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
      copiedNodeId: true,
      currentNode: true,
      currentViewName: true,
      editTwigletModel: true,
      formValid: true,
      isEditing: true,
      mode: true,
      nodeTypeToBeAdded: true,
      textToFilterOn: true,
      traverseDepth: true,
      treeMode: true,
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

  logIn(body) {
    const bodyString = JSON.stringify(body);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers, withCredentials: true });
    const url = `${Config.apiUrl}/login`;
    return this.http.post(url, body, options).map((res: Response) => res.json())
      .catch(this.handleError);
  }

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

  loadUserState(userState: UserState) {
    let currentState = this._userState.getValue().asMutable();
    Reflect.ownKeys(userState).forEach(key => {
      currentState = currentState.set(key as string, fromJS(userState[key]));
    });
    this._userState.next(currentState.asImmutable());
    return Observable.of(userState);
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

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
   * @param {string} id string id of the node
   *
   * @memberOf UserStateService
   */
  setcurrentResourceName(name: string) {
    this._userState.next(this._userState.getValue().set('currentResourceName', name));
  }

  /**
   * Clears the current twiglet to null.
   *
   *
   * @memberOf UserStateService
   */
  clearcurrentResourceName() {
    this._userState.next(this._userState.getValue().set('currentResourceName', null));
    this._userState.next(this._userState.getValue().set('currentTwigletId', null));
    this._userState.next(this._userState.getValue().set('currentTwigletDescription', null));
    this._userState.next(this._userState.getValue().set('currentTwigletRev', null));
  }

  /**
   * Sets the current twiglet selected by the user.
   *
   * @param {string} id string id of the node
   *
   * @memberOf UserStateService
   */
  setCurrentView(id: string) {
    this._userState.next(this._userState.getValue().set('currentViewName', id));
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

  setGravityPoints(gravityPoints) {
    this._userState.next(this._userState.getValue().set('gravityPoints', fromJS(gravityPoints)));
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

  setMode(mode: string) {
    this._userState.next(this._userState.getValue().set('mode', mode));
  }

  toggleTypeFilterActive(type) {
    const currentTypeValue = this._userState.getValue().get('filters').get('types').get(type);
    this._userState.next(this._userState.getValue().setIn(['filters', 'types', type], !currentTypeValue));
  }

  /**
   * Sets where a type filter is active or not.
   *
   * @param {string} type
   * @param {boolean} active
   *
   * @memberOf UserStateService
   */
  setTypeFilterIsActive(type: string, active: boolean) {
    this._userState.next(this._userState.getValue().setIn(['filters', 'types', type], active));
  }

  /**
   * Adds the type to the filter, if it is already there, it just activates it.
   *
   * @param {string} type
   *
   * @memberOf UserStateService
   */
  addTypeFilter(type: string) {
    this.setTypeFilterIsActive(type, true);
  }

  /**
   * removes the type filter from the filters, does not simply deactivate it.
   *
   * @param {string} type
   *
   * @memberOf UserStateService
   */
  removeTypeFilter(type: string) {
    this._userState.next(this._userState.getValue().removeIn(['filters', 'types', type]));
  }

  /**
   * Finds the index of the attribute that matches both the key and value.
   *
   * @private
   * @param {any} key
   * @param {any} value
   * @returns {number}
   *
   * @memberOf UserStateService
   */
  private findIndexOfFilterAttribute(key, value): number {
    const attributes = <List<Map<string, any>>>this._userState.getValue().get('filters').get('attributes');
    let existingIndex = null;
    attributes.some((attribute, index) => {
      if (attribute.get('key') === key && attribute.get('value') === value) {
        existingIndex = index;
        return true;
      }
      return false;
    });
    return existingIndex;
  }

  /**
   * Adds an attribute to our filters.
   *
   * @param {any} key
   * @param {any} value
   *
   * @memberOf UserStateService
   */
  addAttributeFilter(key, value) {
    const attributes = <List<Map<string, any>>>this._userState.getValue().get('filters').get('attributes');
    const existingIndex = this.findIndexOfFilterAttribute(key, value);
    if (existingIndex === null) {
      const newAttributes = attributes.push(Map({
        key,
        value,
        active: true,
      }));
      this._userState.next(this._userState.getValue().setIn(['filters', 'attributes'], newAttributes));
    } else if (!attributes.get(existingIndex).get('active')) {
      this.setAttributeFilterIsActive(key, value, true);
    }
  }

  /**
   * Removes an attribute from our filters.
   *
   * @param {any} key
   * @param {any} value
   *
   * @memberOf UserStateService
   */
  removeAttributeFilter(key, value) {
    const existingIndex = this.findIndexOfFilterAttribute(key, value);
    if (existingIndex !== null) {
      this._userState.next(this._userState.getValue().removeIn(['filters', 'attributes', existingIndex]));
    }
  }

  /**
   * Sets if the attribute filter is active or inactive.
   *
   * @param {any} key
   * @param {any} value
   * @param {any} active
   *
   * @memberOf UserStateService
   */
  setAttributeFilterIsActive(key, value, active) {
    const existingIndex = this.findIndexOfFilterAttribute(key, value);
    if (existingIndex !== null) {
      this._userState.next(this._userState.getValue().setIn(['filters', 'attributes', existingIndex, 'active'], active));
    }
  }

  toggleAttributeFilterActive(key, value) {
    const existingIndex = this.findIndexOfFilterAttribute(key, value);
    if (existingIndex !== null) {
      const attributeActiveState = this._userState.getValue().get('filters').get('attributes').get(existingIndex).get('active');
      this._userState.next(this._userState.getValue().setIn(['filters', 'attributes', existingIndex, 'active'], !attributeActiveState));
    }
  }

  /**
   * Clears the current node type that would be added to the twiglet.
   *
   *
   * @memberOf UserStateService
   */
  clearNodeTypeToBeAdded() {
    this._userState.next(this._userState.getValue().set('nodeTypeToBeAdded', null));
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
  setShowNodeLabels(bool: boolean) {
    this._userState.next(this._userState.getValue().set('showNodeLabels', bool));
  }

  setShowLinkLabels(bool: boolean) {
    this._userState.next(this._userState.getValue().set('showLinkLabels', bool));
  }

  /**
   * Sets the current node type to be added to the twiglet by dragging.
   *
   * @param {string} type the type of node to be added to the twiglet.
   *
   * @memberOf UserStateService
   */
  toggleSortNodesAscending() {
    const userState = this._userState.getValue();
    this._userState.next(userState.set('sortNodesAscending', !userState.get('sortNodesAscending')));
  }

  /**
   * Sets the current node type to be added to the twiglet by dragging.
   *
   * @param {string} type the type of node to be added to the twiglet.
   *
   * @memberOf UserStateService
   */
  setSortNodesBy(key: string) {
    this._userState.next(this._userState.getValue().set('sortNodesBy', key));
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

  setFormValid(bool: boolean) {
    this._userState.next(this._userState.getValue().set('formValid', bool));
  }

  setActiveTwiglet(bool: boolean) {
    this._userState.next(this._userState.getValue().set('activeTwiglet', bool));
  }

  setActiveModel(bool: boolean) {
    this._userState.next(this._userState.getValue().set('activeModel', bool));
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
