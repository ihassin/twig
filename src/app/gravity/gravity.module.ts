import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import 'hammerjs';

import { router } from './../app.router';
import { GravityEditorComponent } from './gravity-editor/gravity-editor.component';
import { GravityHeaderComponent } from './gravity-header/gravity-header.component';

@NgModule({
    declarations: [
      GravityEditorComponent,
      GravityHeaderComponent
    ],
    entryComponents: [
    ],
    exports: [
      GravityHeaderComponent,
    ],
    imports: [
        CommonModule,
        Ng2PageScrollModule.forRoot(),
        NgbModule.forRoot(),
        router,
        ToastModule.forRoot(),
    ]
})
export class GravityModule { }
