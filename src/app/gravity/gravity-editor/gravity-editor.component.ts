import { GravityPoint } from './../../../non-angular/interfaces/userState/index';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { StateService } from './../../state.service';
import { Component, OnInit, ChangeDetectionStrategy, ElementRef, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { D3, D3Service, ForceLink, Selection, Simulation } from 'd3-ng2-service';

@Component({
  providers: [D3Service],
  selector: 'app-gravity-editor',
  styleUrls: ['./gravity-editor.component.scss'],
  templateUrl: './gravity-editor.component.html',
})
export class GravityEditorComponent implements OnInit, OnDestroy {
  d3: D3;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  radius = 20;
  routeSubscription: Subscription;
  width = 800;
  height = 500;
  pointsAsArray: Array<GravityPoint> = [];
  pointsAsObject: Object;
  simulation: Simulation<GravityPoint, undefined>;
  userStateSub: Subscription;

  constructor(private stateService: StateService, d3Service: D3Service, private element: ElementRef) {
    this.d3 = d3Service.getD3();
    this.userStateSub = this.stateService.userState.observable.subscribe(userState => {
      this.pointsAsObject = userState.get('gravityPoints').toJS();
      this.pointsAsArray = Reflect.ownKeys(this.pointsAsObject).reduce((array, key) => {
        array.push(this.pointsAsObject[key]);
        return array;
      }, []);
      this.simulation.nodes(this.pointsAsArray);
    });
    this.simulation = this.d3.forceSimulation(this.pointsAsArray).on('tick', this.updateGravityPoints.bind(this));
  }


  ngOnInit() {
    this.onResize();
    this.canvas = <HTMLCanvasElement>document.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.d3.select(this.canvas)
    .on('click', this.addGravityPoint.bind(this))
    .call(
      this.d3.drag()
        .container(this.canvas)
        .subject(this.dragsubject.bind(this))
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this)));
  }

  ngOnDestroy() {
    this.userStateSub.unsubscribe();
  }

  addGravityPoint() {
    // Don't add one if an existing point is being clicked.
    if (this.simulation.find(this.d3.event.x, this.d3.event.y, this.radius)) {
      return;
    }
  }

  dragsubject() {
    return this.simulation.find(this.d3.event.x, this.d3.event.y, this.radius);
  }

  dragstarted() {
    this.d3.event.subject.x = this.d3.event.subject.x;
    this.d3.event.subject.y = this.d3.event.subject.y;
  }

  dragged() {
    this.pointsAsObject[this.d3.event.subject.name].x = this.d3.event.x;
    this.pointsAsObject[this.d3.event.subject.name].y = this.d3.event.y;
  }

  dragended() {
    this.stateService.userState.setGravityPoints(this.simulation.nodes().reduce((object, gravityPoint) => {
      object[gravityPoint.name] = gravityPoint;
      return object;
    }, {}));
  }

  updateGravityPoints() {
    if (this.context) {
      this.context.clearRect(0, 0, this.width, this.height);
      this.pointsAsArray.forEach(this.drawCircle.bind(this));
    }
  }

  drawCircle(gravityPoint: GravityPoint) {
    this.context.moveTo(gravityPoint.x + this.radius, gravityPoint.y);
    this.context.beginPath();
    this.context.arc(gravityPoint.x, gravityPoint.y, this.radius, 0, 2 * Math.PI);
    this.context.fillStyle = gravityPoint.color;
    this.context.fill();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.width = this.element.nativeElement.offsetWidth;
    this.height = this.element.nativeElement.offsetHeight;
  }

}
