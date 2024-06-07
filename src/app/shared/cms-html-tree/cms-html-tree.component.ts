import { Component, Input, OnInit } from '@angular/core';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';

@Component({
  selector: 'app-cms-html-tree',
  templateUrl: './cms-html-tree.component.html',
})
export class CmsHtmlTreeComponent implements OnInit {
  static nextId = 0;
  id = ++CmsHtmlTreeComponent.nextId;
  @Input() optionHeaderDisplay = true;
  @Input() optionActionMainDisplay = true;
  @Input() optionFooterDisplay = true;
  @Input()
  public set optionLoading(v: ProgressSpinnerModel) {
    this.loading = v;
  }
  loading = new ProgressSpinnerModel();
  constructor() { }
  ngOnInit(): void {

  }
  /*
  <app-cms-html-tree [optionLoading]="loading" [optionHeaderDisplay]="true" [optionActionMainDisplay]="true" [optionFooterDisplay]="false">
<ng-container  cms-tree-header>
 </ng-container>
 <ng-container  cms-tree-action>
      <!--begin:::::::::::::::::::::::::::::::::::::::::cms-header-->
      --------------------------------------
      <!--end:::::::::::::::::::::::::::::::::::::::::cms-header-->
    </ng-container>
    <ng-container  cms-action-main>
      <!--begin:::::::::::::::::::::::::::::::::::::::::cms-action-->
      --------------------------------------
      <!--end:::::::::::::::::::::::::::::::::::::::::cms-action-->
    </ng-container>
    <ng-container  cms-body>
      <!--begin:::::::::::::::::::::::::::::::::::::::::cms-body-->
      --------------------------------------
      <!--end:::::::::::::::::::::::::::::::::::::::::cms-body-->
    </ng-container>
    <ng-container  cms-footer>
      <!--begin:::::::::::::::::::::::::::::::::::::::::cms-footer-->
      --------------------------------------
      <!--end:::::::::::::::::::::::::::::::::::::::::cms-footer-->
    </ng-container>
  </app-cms-html-tree>
*/
}

