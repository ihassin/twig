import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-gravity-header',
  styleUrls: ['./gravity-header.component.scss'],
  templateUrl: './gravity-header.component.html',
})
export class GravityHeaderComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToGravity() {
    this.router.navigate(['gravity']);
  }

}
