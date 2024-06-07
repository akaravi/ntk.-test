import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CoreCurrencyService, CoreModuleService
} from 'ntk-cms-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreCurrencyAddComponent } from './add/add.component';
import { CoreCurrencyComponent } from './coreCurrency.component';
import { CoreCurrencyRouting } from './coreCurrency.routing';
import { CoreCurrencyEditComponent } from './edit/edit.component';
import { CoreCurrencyListComponent } from './list/list.component';
import { CoreCurrencySelectorComponent } from './selector/selector.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { CmsFileManagerModule } from 'ntk-cms-filemanager';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';


@NgModule({
  declarations: [
    CoreCurrencyComponent,
    CoreCurrencyListComponent,
    CoreCurrencyAddComponent,
    CoreCurrencyEditComponent,
    CoreCurrencySelectorComponent,
  ],
  exports: [
    CoreCurrencyComponent,
    CoreCurrencyListComponent,
    CoreCurrencyAddComponent,
    CoreCurrencyEditComponent,
    CoreCurrencySelectorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreCurrencyRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,

    CmsFileManagerModule.forRoot()

  ],
  providers: [
    CoreCurrencyService,
    CoreModuleService,
    CmsConfirmationDialogService
  ]
})
export class CoreCurrencyCmsModule {
}
