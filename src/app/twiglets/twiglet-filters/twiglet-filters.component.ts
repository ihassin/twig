import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { StateService } from './../../state.service';
import { UserState } from './../../../non-angular/interfaces/userState/index';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-twiglet-filters',
  styleUrls: ['./twiglet-filters.component.scss'],
  templateUrl: './twiglet-filters.component.html',
})
export class TwigletFiltersComponent implements OnInit {

  @Input() userState;

  constructor(private stateService: StateService) { }

  ngOnInit() {
  }

  toggleTypeActive(type) {
    this.stateService.userState.toggleTypeFilterActive(type);
  }

  removeType(type) {
    this.stateService.userState.removeTypeFilter(type);
  }

  toggleAttributeActive(attr) {
    this.stateService.userState.toggleAttributeFilterActive(attr.get('key'), attr.get('value'));
  }

  removeAttribute(attr) {
    this.stateService.userState.removeAttributeFilter(attr.get('key'), attr.get('value'));
  }

}
