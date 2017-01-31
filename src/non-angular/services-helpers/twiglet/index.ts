import { router } from './../../../app/app.router';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { fromJS, Map, OrderedMap } from 'immutable';
import { clone, merge } from 'ramda';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Twiglet } from './../../interfaces/twiglet';
import { ChangeLogService } from './changelog.service';
export { ChangeLogService } from './changelog.service';
import { ModelService, } from './model.service';
export { ModelService, } from './model.service';

import { TwigletToSend } from './../../interfaces/twiglet';
import { UserStateService } from '../userState';
import { StateCatcher } from '../index';
import { D3Node, isD3Node, Link } from '../../interfaces/twiglet';
import { apiUrl, modelsFolder, twigletsFolder } from '../../config';

interface IdOnly {
  id: string;
}

export class TwigletService {

  public changeLogService: ChangeLogService;
  public modelService: ModelService;

  private _twiglet: BehaviorSubject<Map<string, any>> =
    new BehaviorSubject(Map<string, any>({
      _id: null,
      _rev: null,
      description: null,
      links: fromJS({}),
      name: null,
      nodes: fromJS({}),
    }));

  private _twigletBackup: Map<string, any> = null;

  constructor(private http: Http, public userState: UserStateService,
              private toastr: ToastsManager,
              private router: Router) {
    this.changeLogService = new ChangeLogService();
    this.modelService = new ModelService();
  }
  /**
   * Returns an observable. Because BehaviorSubject is used, the current values are pushed
   * on the first subscription
   *
   * @readonly
   * @type {Observable<Map<string, Map<string, any>>>}
   * @memberOf NodesService
   */
  get observable(): Observable<Map<string, any>> {
    return this._twiglet.asObservable();
  }

  createBackup() {
    this._twigletBackup = this._twiglet.getValue();
  }

  restoreBackup() {
    this._twiglet.next(this._twigletBackup);
  }

  /**
   * Handles server errors.
   *
   * @param {any} error
   *
   * @memberOf TwigletService
   */
  handleError(error) {
    console.error(error);
    this.toastr.error(error.statusText, 'Server Error');
  }

  /**
   * GETs a twiglet from the server.
   *
   * @param {any} id
   *
   * @memberOf TwigletService
   */
  loadTwiglet(id) {
    const self = this;
    this.http.get(`${apiUrl}/${twigletsFolder}/${id}`).map((res: Response) => res.json())
      .subscribe(this.processLoadedTwiglet.bind(this), this.handleError.bind(self));
  }

  /**
   * Processes a loaded twiglet from the server
   *
   * @param {any} twigletFromServer
   * @returns
   *
   * @memberOf TwigletService
   */
  processLoadedTwiglet(twigletFromServer: Twiglet) {
    this._twiglet.next(fromJS({ _id: '', nodes: Map({}), links: Map({}) }));
    return this.http.get(twigletFromServer.model_url).map((res: Response) => res.json())
      .subscribe(modelFromServer => {
        this.modelService.clearModel();
        this.clearLinks();
        this.clearNodes();
        this.modelService.setModel(modelFromServer);
        let twiglet = this._twiglet.getValue().asMutable();
        const newTwiglet = {
          _id: twigletFromServer._id,
          _rev: twigletFromServer._rev,
          description: twigletFromServer.description,
          links: convertArrayToMapForImmutable(twigletFromServer.links as Link[]),
          name: twigletFromServer.name,
          nodes: convertArrayToMapForImmutable(twigletFromServer.nodes as D3Node[]),
        };
        this._twiglet.next(fromJS(newTwiglet));
      });
  }

  /**
   * Sets the name of the twiglet.
   *
   * @param {string} name
   *
   * @memberOf TwigletService
   */
  setName(name: string) {
    this._twiglet.next(this._twiglet.getValue().set('name', name));
  }

  /**
   * Sets the description of the twiglet.
   *
   * @param {string} description
   *
   * @memberOf TwigletService
   */
  setDescription(description: string) {
    this._twiglet.next(this._twiglet.getValue().set('description', description));
  }

  /**
   * Adds a twiglet to the backend, perhaps this should be on the backend service?
   *
   * @param {any} body
   * @returns {Observable<any>}
   *
   * @memberOf TwigletService
   */
  addTwiglet(body): Observable<any> {
    let bodyString = JSON.stringify(body);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(`${apiUrl}/${twigletsFolder}`, body, options).map((res: Response) => res.json());
  }

  /**
   * Removes a twiglet from the database, perhaps this should be on the backend service?
   *
   * @param {any} _id
   * @returns {Observable<any>}
   *
   * @memberOf TwigletService
   */
  removeTwiglet(_id): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.delete(`${apiUrl}/${twigletsFolder}/${_id}`, options).map((res: Response) => res.json());
  }

  /**
   * Saves changes to the currently loaded twiglet.
   *
   * @param {string} commitMessage
   * @returns
   *
   * @memberOf TwigletService
   */
  saveChanges(commitMessage: string) {
    const twiglet = this._twiglet.getValue();
    const twigletToSend: TwigletToSend = {
      _id: twiglet.get('_id'),
      _rev: twiglet.get('_rev'),
      commitMessage: commitMessage,
      description: twiglet.get('description'),
      links: convertMapToArrayForUploading<Link>(twiglet.get('links')),
      name: twiglet.get('name'),
      nodes: convertMapToArrayForUploading<D3Node>(twiglet.get('nodes')),
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.put(`${apiUrl}/${twigletsFolder}/${twigletToSend._id}`, twigletToSend, options)
      .map((res: Response) => res.json())
      .flatMap(newTwiglet => {
        this._twiglet.next(fromJS(newTwiglet));
        this._twigletBackup = null;
        return Observable.of(newTwiglet);
      });
  }

  /**
   * Adds a node to the twiglet.
   *
   * @param {D3Node} newNode the new node to be added.
   *
   * @memberOf NodesService
   */
  addNode(newNode: D3Node) {
    this.addNodes([newNode]);
  }

  /**
   * Adds an array of nodes to the twiglet.
   *
   * @param {D3Node[]} newNodes an array of nodes be to be added.
   *
   * @memberOf NodesService
   */
  addNodes(newNodes: D3Node[]) {
    const twiglet = this._twiglet.getValue();
    const mutableNodes = twiglet.get('nodes').asMutable();
    const newSetOfNodes = newNodes.reduce((mutable, node) => {
      return mutable.set(node.id, fromJS(node));
    }, mutableNodes).asImmutable();
    this._twiglet.next(twiglet.set('nodes', newSetOfNodes));
  }

  clearNodes() {
    const twiglet = this._twiglet.getValue();
    const mutableNodes = twiglet.get('nodes').asMutable();
    mutableNodes.clear();
    this._twiglet.next(twiglet.set('nodes', mutableNodes.asImmutable()));
  }

  /**
   * Updates a single node on the twiglet. Contains a state catcher so that D3 doesn't keep looping
   * on itself when it pushes x and y updates and think it needs to recalculate again and again and again.
   *
   * @param {D3Node} updatedNode The node to be updated, requires ID and any other changes being made.
   * @param {StateCatcher} [stateCatcher] alerts the caller of the state before it is pushed.
   *                                      Don't use it, unless you are working on D3 stuff. Seriously.
   *
   * @memberOf NodesService
   */
  updateNode(updatedNode: D3Node, stateCatcher?: StateCatcher) {
    this.updateNodes([updatedNode], stateCatcher);
  }

  /**
   * Updates multiple nodes on the twiglet. Contains a state catcher so that D3 doesn't keep looping
   * on itself when it pushes x and y updates and think it needs to recalculate again and again and again.
   *
   * @param {D3Node[]} updatedNodes the array of nodes to be updated, requires ID and any other changes being made.
   * @param {StateCatcher} [stateCatcher] alerts the caller of the state before it is pushed.
   *                                      Don't use it, unless you are working on D3 stuff. Seriously.
   *
   * @memberOf NodesService
   */
  updateNodes(updatedNodes: D3Node[], stateCatcher?: StateCatcher) {
    let twiglet = this._twiglet.getValue();
    const mutableNodes = twiglet.get('nodes').asMutable();
    const newSetOfNodes  = updatedNodes.reduce((mutable, node) => {
      const currentNode = mutableNodes.get(node.id).toJS();
      return mutable.set(node.id, fromJS(merge(currentNode, node)));
    }, mutableNodes).asImmutable();
    twiglet = twiglet.set('nodes', newSetOfNodes);
    if (stateCatcher) {
      stateCatcher.data = twiglet;
    }
    this._twiglet.next(twiglet);
  }

  /**
   * Removes a node from the twiglet.
   *
   * @param {D3Node} removedNode The node to be removed, only requires id, ignores other keys.
   *
   * @memberOf NodesService
   */
  removeNode(removedNode: D3Node) {
    this.removeNodes([removedNode]);
  }

  /**
   * Removes multiple nodes from the twiglet.
   *
   * @param {D3Node[]} removedNodes The nodes to be removed, only requires id, ignores other keys
   *
   * @memberOf NodesService
   */
  removeNodes(removedNodes: D3Node[]) {
    const twiglet = this._twiglet.getValue();
    const mutableNodes = twiglet.get('nodes').asMutable();
    const newSetOfNodes = removedNodes.reduce((mutable, node) => {
      return mutable.delete(node.id);
    }, mutableNodes).asImmutable();
    this._twiglet.next(twiglet.set('nodes', newSetOfNodes));
  }

  /**
   * Adds a link to the twiglet. Works by wrapping single link in array and calling addLinks
   *
   * @param {Link} newLink Requires id, source and target to work correctly.
   *
   * @memberOf LinksService
   */
  addLink(newLink: Link) {
    this.addLinks([newLink]);
  }

  /**
   * Adds multiple links to the twiglets.
   *
   * @param {Link[]} newLinks requires id, source and target to work correctly/
   *
   * @memberOf LinksService
   */
  addLinks(newLinks: Link[]) {
    const twiglet = this._twiglet.getValue();
    const mutableLinks = twiglet.get('links').asMutable();
    const newSetOfLinks = newLinks.reduce((mutable, link) => {
      return mutable.set(link.id, fromJS(sourceAndTargetBackToIds(link)));
    }, mutableLinks).asImmutable();
    this._twiglet.next(twiglet.set('links', newSetOfLinks));
  }

  clearLinks() {
    const twiglet = this._twiglet.getValue();
    const mutableLinks = twiglet.get('links').asMutable();
    mutableLinks.clear();
    this._twiglet.next(twiglet.set('links', mutableLinks.asImmutable()));
  }

  /**
   * updates any {key, value} pair on links except for id. Works by wrapping in array and calling addLinks.
   *
   * @param {Link} updatedLink requires id and updates any other {key, value} pair
   *
   * @memberOf LinksService
   */
  updateLink(updatedLink: Link) {
    this.updateLinks([updatedLink]);
  }

  /**
   * updates any {key, value} pair for an array of nodes (except for id).
   *
   * @param {Link[]} updatedLinks requires id and updates any {key, value} pair
   *
   * @memberOf LinksService
   */
  updateLinks(updatedLinks: Link[]) {
    const twiglet = this._twiglet.getValue();
    const mutableLinks = twiglet.get('links').asMutable();
    const newSetOfLinks = updatedLinks.reduce((mutable, link) => {
      const currentLink = mutableLinks.get(link.id).toJS();
      return mutable.set(link.id, fromJS(merge(currentLink, sourceAndTargetBackToIds(link))));
    }, mutableLinks).asImmutable();
    this._twiglet.next(twiglet.set('links', newSetOfLinks));
  }

  /**
   * Removes a single from the twiglet. Works by wrapping singleton in array and calling removeLinks.
   *
   * @param {Link} removedLink only needs { id }
   *
   * @memberOf LinksService
   */
  removeLink(removedLink: IdOnly) {
    this.removeLinks([removedLink]);
  }

  /**
   * Removes multiple links from the twiglet.
   *
   * @param {Link[]} removedLinks only needs { id }
   *
   * @memberOf LinksService
   */
  removeLinks(removedLinks: IdOnly[]) {
    const twiglet = this._twiglet.getValue();
    const mutableLinks = twiglet.get('links').asMutable();
    const newSetOfLinks = removedLinks.reduce((mutable, link) => {
      return mutable.delete(link.id);
    }, mutableLinks).asImmutable();
    this._twiglet.next(twiglet.set('links', newSetOfLinks));
  }
}

function sourceAndTargetBackToIds(link: Link) {
  // There is no reason to have a node memory reference anywhere outside of twiglet-graph
  const returner = clone(link);
  if (returner.source && isD3Node(returner.source)) {
    returner.source = returner.source.id;
  }
  if (returner.target && isD3Node(returner.target)) {
    returner.target = returner.target.id;
  }
  return returner;
}

function convertMapToArrayForUploading<K>(map: Map<string, any>): K[] {
  const mapAsJs = map.toJS();
  return Reflect.ownKeys(mapAsJs).reduce((array, key) => {
    array.push(mapAsJs[key]);
    return array;
  }, []);
}

function convertArrayToMapForImmutable<K>(array: any[]): Map<string, K> {
  return array.reduce((mutable, node) => {
    return mutable.set(node.id, fromJS(node));
  }, Map({}).asMutable()).asImmutable();
}
