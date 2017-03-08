import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { D3Service } from 'd3-ng2-service';
import { DragulaModule } from 'ng2-dragula';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { TrimValueAccessorModule } from 'ng-trim-value-accessor';

import 'hammerjs';

import { router } from './app.router';
import { AddNodeByDraggingButtonComponent } from './twiglets/add-node-by-dragging-button/add-node-by-dragging-button.component';
import { AppComponent } from './app.component';
import { ChangelogListComponent } from './changelog-list/changelog-list.component';
import { CloneModelModalComponent } from './models/clone-model-modal/clone-model-modal.component';
import { CommitModalComponent } from './commit-modal/commit-modal.component';
import { CopyPasteNodeComponent } from './twiglets/copy-paste-node/copy-paste-node.component';
import { CreateModelModalComponent } from './models/create-model-modal/create-model-modal.component';
import { CreateTwigletModalComponent } from './twiglets/create-twiglet-modal/create-twiglet-modal.component';
import { DeleteModelConfirmationComponent } from './delete-confirmation/delete-model-confirmation.component';
import { DeleteTwigletConfirmationComponent } from './delete-confirmation/delete-twiglet-confirmation.component';
import { DeleteViewConfirmationComponent } from './delete-confirmation/delete-view-confirmation.component';
import { EditLinkModalComponent } from './twiglets/edit-link-modal/edit-link-modal.component';
import { EditModeButtonComponent } from './edit-mode-button/edit-mode-button.component';
import { EditModelDetailsComponent } from './models/edit-model-details/edit-model-details.component';
import { EditNodeModalComponent } from './twiglets/edit-node-modal/edit-node-modal.component';
import { EditTwigletDetailsComponent } from './twiglets/edit-twiglet-details/edit-twiglet-details.component';
import { FilterNodesPipe } from './filter-nodes.pipe';
import { FontAwesomeIconPickerComponent } from './font-awesome-icon-picker/font-awesome-icon-picker.component';
import { FontAwesomeToggleButtonComponent } from './font-awesome-toggle-button/font-awesome-toggle-button.component';
import { FooterComponent } from './footer/footer.component';
import { FormControlsSortPipe } from './form-controls-sort.pipe';
import { HeaderComponent } from './header/header.component';
import { HeaderEnvironmentComponent } from './twiglets/header-environment/header-environment.component';
import { HeaderInfoBarComponent } from './header-info-bar/header-info-bar.component';
import { HeaderModelComponent } from './models/header-model/header-model.component';
import { HeaderModelEditComponent } from './models/header-model-edit/header-model-edit.component';
import { HeaderSimulationControlsComponent } from './twiglets/header-simulation-controls/header-simulation-controls.component';
import { HeaderTwigletComponent } from './twiglets/header-twiglet/header-twiglet.component';
import { HeaderTwigletEditComponent } from './twiglets/header-twiglet-edit/header-twiglet-edit.component';
import { HeaderViewComponent } from './twiglets/header-view/header-view.component';
import { ImmutableMapOfMapsPipe } from './immutable-map-of-maps.pipe';
import { KeyValuesPipe } from './key-values.pipe';
import { LeftSideBarComponent } from './left-side-bar/left-side-bar.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { LoginButtonComponent } from './login-button/login-button.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { ModelDropdownComponent } from './models/model-dropdown/model-dropdown.component';
import { ModelFormComponent } from './models/model-form/model-form.component';
import { ModelInfoComponent } from './models/model-info/model-info.component';
import { ModelViewComponent } from './models/model-view/model-view.component';
import { NodeInfoComponent } from './twiglets/node-info/node-info.component';
import { NodeSearchPipe } from './node-search.pipe';
import { ObjectSortPipe } from './object-sort.pipe';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { OverwriteDialogComponent } from './overwrite-dialog/overwrite-dialog.component';
import { PrimitiveArraySortPipe } from './primitive-array-sort.pipe';
import { RightSideBarComponent } from './right-side-bar/right-side-bar.component';
import { SliderWithLabelComponent } from './slider-with-label/slider-with-label.component';
import { SortImmutablePipe } from './sort-immutable.pipe';
import { SplashComponent } from './splash/splash.component';
import { StateService } from './state.service';
import { TwigletDropdownComponent } from './twiglets/twiglet-dropdown/twiglet-dropdown.component';
import { TwigletFiltersComponent } from './twiglets/twiglet-filters/twiglet-filters.component';
import { TwigletGraphComponent } from './twiglets/twiglet-graph/twiglet-graph.component';
import { TwigletModelViewComponent } from './twiglets/twiglet-model-view/twiglet-model-view.component';
import { TwigletNodeListComponent } from './twiglets/twiglet-node-list/twiglet-node-list.component';
import { ViewDropdownComponent } from './twiglets/view-dropdown/view-dropdown.component';
import { ViewsSaveModalComponent } from './twiglets/views-save-modal/views-save-modal.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AddNodeByDraggingButtonComponent,
    AppComponent,
    ChangelogListComponent,
    CloneModelModalComponent,
    CopyPasteNodeComponent,
    CommitModalComponent,
    CreateModelModalComponent,
    CreateTwigletModalComponent,
    DeleteModelConfirmationComponent,
    DeleteTwigletConfirmationComponent,
    DeleteViewConfirmationComponent,
    EditLinkModalComponent,
    EditModeButtonComponent,
    EditModelDetailsComponent,
    EditNodeModalComponent,
    EditTwigletDetailsComponent,
    FilterNodesPipe,
    FontAwesomeIconPickerComponent,
    FontAwesomeToggleButtonComponent,
    FooterComponent,
    FormControlsSortPipe,
    HeaderComponent,
    HeaderEnvironmentComponent,
    HeaderInfoBarComponent,
    HeaderModelComponent,
    HeaderModelEditComponent,
    HeaderSimulationControlsComponent,
    HeaderTwigletComponent,
    HeaderTwigletEditComponent,
    HeaderViewComponent,
    ImmutableMapOfMapsPipe,
    KeyValuesPipe,
    LeftSideBarComponent,
    LoadingSpinnerComponent,
    LoginButtonComponent,
    LoginModalComponent,
    ModelDropdownComponent,
    ModelFormComponent,
    ModelInfoComponent,
    ModelViewComponent,
    NodeInfoComponent,
    NodeSearchPipe,
    ObjectToArrayPipe,
    ObjectSortPipe,
    OverwriteDialogComponent,
    PrimitiveArraySortPipe,
    RightSideBarComponent,
    SliderWithLabelComponent,
    SortImmutablePipe,
    SplashComponent,
    TwigletDropdownComponent,
    TwigletFiltersComponent,
    TwigletGraphComponent,
    TwigletModelViewComponent,
    TwigletNodeListComponent,
    ViewDropdownComponent,
    ViewsSaveModalComponent,
  ],
  entryComponents: [
    CloneModelModalComponent,
    CommitModalComponent,
    CreateModelModalComponent,
    CreateTwigletModalComponent,
    DeleteModelConfirmationComponent,
    DeleteTwigletConfirmationComponent,
    DeleteViewConfirmationComponent,
    EditLinkModalComponent,
    EditModelDetailsComponent,
    EditNodeModalComponent,
    EditTwigletDetailsComponent,
    LoadingSpinnerComponent,
    LoginModalComponent,
    OverwriteDialogComponent,
    ViewsSaveModalComponent,
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    FormsModule,
    HttpModule,
    Ng2PageScrollModule.forRoot(),
    NgbModule.forRoot(),
    ReactiveFormsModule,
    router,
    ToastModule.forRoot(),
    TrimValueAccessorModule,
  ],
  providers: [DatePipe, StateService],
})
export class AppModule { }
