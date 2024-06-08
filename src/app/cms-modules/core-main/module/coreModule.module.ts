import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CoreModuleService
} from 'ntk-cms-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModuleAddComponent } from './add/add.component';
import { CoreModuleComponent } from './coreModule.component';
import { CoreModuleRouting } from './coreModule.routing';
import { CoreModuleEditComponent } from './edit/edit.component';
import { CoreModuleListComponent } from './list/list.component';
import { CoreModuleSelectorComponent } from './selector/selector.component';
import { CoreModuleTreeComponent } from './tree/tree.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { CmsFileManagerModule } from 'ntk-cms-filemanager';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { CoreSharedModule } from '../core.shared.module';
import { CoreModuleSelectionlistComponent } from './selectionlist/selectionlist.component';


@NgModule({
  declarations: [
    CoreModuleComponent,
    CoreModuleListComponent,
    CoreModuleAddComponent,
    CoreModuleEditComponent,
    CoreModuleSelectorComponent,
    CoreModuleTreeComponent,
    CoreModuleSelectionlistComponent,

  ],
  exports: [
    CoreModuleComponent,
    CoreModuleListComponent,
    CoreModuleAddComponent,
    CoreModuleEditComponent,
    CoreModuleSelectorComponent,
    CoreModuleTreeComponent,
    CoreModuleSelectionlistComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModuleRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule,
    AngularEditorModule,

    CoreSharedModule,
    CmsFileManagerModule,
  ],
  providers: [
    CoreModuleService,
    CmsConfirmationDialogService
  ]
})
export class CoreModuleModule {
}
