import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CoreModuleService,
  CoreUserGroupService
} from 'ntk-cms-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreUserGroupAddComponent } from './add/add.component';
import { CoreUserGroupComponent } from './coreUserGroup.component';
import { CoreUserGroupRouting } from './coreUserGroup.routing';
import { CoreUserGroupEditComponent } from './edit/edit.component';
import { CoreUserGroupListComponent } from './list/list.component';
import { CoreUserGroupSelectorComponent } from './selector/selector.component';
import { CoreUserGroupTreeComponent } from './tree/tree.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { CoreUserGroupSelectionlistComponent } from './selectionlist/selectionlist.component';


@NgModule({
  declarations: [
    CoreUserGroupComponent,
    CoreUserGroupListComponent,
    CoreUserGroupAddComponent,
    CoreUserGroupEditComponent,
    CoreUserGroupSelectorComponent,
    CoreUserGroupTreeComponent,
    CoreUserGroupSelectionlistComponent,
  ],
  exports: [
    CoreUserGroupComponent,
    CoreUserGroupListComponent,
    CoreUserGroupAddComponent,
    CoreUserGroupEditComponent,
    CoreUserGroupSelectorComponent,
    CoreUserGroupTreeComponent,
    CoreUserGroupSelectionlistComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreUserGroupRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),

    SharedModule,
    AngularEditorModule,


  ],
  providers: [
    CoreUserGroupService,
    CoreModuleService,
    CmsConfirmationDialogService,
  ]
})
export class CoreUserGroupCmsModule {
}
