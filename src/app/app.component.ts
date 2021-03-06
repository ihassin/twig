import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ModuleWithProviders } from '@angular/core';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private toastr: ToastsManager, vRef: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vRef);
  }

  ngOnInit() {  }
}
