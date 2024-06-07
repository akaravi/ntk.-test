import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CoreDeviceService, CoreModuleService
} from 'ntk-cms-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreDeviceAddComponent } from './add/add.component';
import { CoreDeviceComponent } from './coreDevice.component';
import { CoreDeviceRouting } from './coreDevice.routing';
import { CoreDeviceEditComponent } from './edit/edit.component';
import { CoreDeviceListComponent } from './list/list.component';
import { CoreDeviceSelectorComponent } from './selector/selector.component';
import { CoreDeviceTreeComponent } from './tree/tree.component';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';



@NgModule({
  declarations: [
    CoreDeviceComponent,
    CoreDeviceListComponent,
    CoreDeviceAddComponent,
    CoreDeviceEditComponent,
    CoreDeviceSelectorComponent,
    CoreDeviceTreeComponent,
  ],
  exports: [
    CoreDeviceComponent,
    CoreDeviceListComponent,
    CoreDeviceAddComponent,
    CoreDeviceEditComponent,
    CoreDeviceSelectorComponent,
    CoreDeviceTreeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreDeviceRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,


  ],
  providers: [
    CoreDeviceService,
    CoreModuleService,
    CmsConfirmationDialogService,
  ]
})
export class CoreDeviceModule {
}
