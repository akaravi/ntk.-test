
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import {
  AccessModel, CoreCpMainMenuCmsUserGroupModel,
  CoreCpMainMenuCmsUserGroupService, CoreCpMainMenuModel, CoreCpMainMenuService, CoreEnumService, CoreModuleModel,
  CoreUserGroupModel,
  ErrorExceptionResult, ErrorExceptionResultBase, FilterDataModel, FilterModel, FormInfoModel, InfoEnumModel, ManageUserAccessDataTypesEnum
} from 'ntk-cms-api';
import { EditBaseComponent } from 'src/app/core/cmsComponent/editBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-user-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreCpMainMenuEditComponent extends EditBaseComponent<CoreCpMainMenuService, CoreCpMainMenuModel, number>
  implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreCpMainMenuEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreCpMainMenuService: CoreCpMainMenuService,
    public coreCpMainMenuCmsUserGroupService: CoreCpMainMenuCmsUserGroupService,
    private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public tokenHelper: TokenHelper,
  ) {
    super(coreCpMainMenuService, new CoreCpMainMenuModel(), publicHelper);

    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    if (data) {
      this.requestId = +data.id || 0;
    }
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;



  appLanguage = 'fa';


  dataModelResult: ErrorExceptionResultBase = new ErrorExceptionResultBase();
  dataModel: CoreCpMainMenuModel = new CoreCpMainMenuModel();

  formInfo: FormInfoModel = new FormInfoModel();

  dataModelEnumMenuPlaceTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  dataAccessModel: AccessModel;

  fileManagerOpenForm = false;

  dataCoreCpMainMenuModel: CoreUserGroupModel[];
  dataCoreCpMainMenuIds: number[] = [];
  dataCoreCpMainMenuCmsUserGroupModel: CoreCpMainMenuCmsUserGroupModel[];

  ngOnInit(): void {
    if (this.requestId > 0) {
      this.translate.get('TITLE.Edit').subscribe((str: string) => { this.formInfo.formTitle = str; });
      this.DataGetOneContent();
    } else {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }


    this.getEnumMenuPlaceType();
  }
  getEnumMenuPlaceType(): void {
    this.coreEnumService.ServiceMenuPlaceTypeEnum().subscribe((next) => {
      this.dataModelEnumMenuPlaceTypeResult = next;
    });
  }

  DataGetOneContent(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.formAlert = this.translate.instant('MESSAGE.Receiving_Information_From_The_Server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    /*َAccess Field*/
    this.coreCpMainMenuService.setAccessLoad();
    this.coreCpMainMenuService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
    this.coreCpMainMenuService.ServiceGetOneById(this.requestId).subscribe({
      next: (ret) => {
        /*َAccess Field*/
        this.dataAccessModel = ret.access;
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
        this.dataModel = ret.item;
        if (ret.isSuccess) {
          this.DataGetAllMenuCoreUserGroup();
          this.formInfo.formTitle = this.formInfo.formTitle + ' ' + ret.item.title;
          this.formInfo.formAlert = '';
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );
  }
  DataGetAllMenuCoreUserGroup(): void {

    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.formAlert = this.translate.instant('MESSAGE.Getting_access_category_from_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    const filteModelContent = new FilterModel();
    const filter = new FilterDataModel();
    filter.propertyName = 'CmsCpMainMenu_Id';
    filter.value = this.requestId;
    filteModelContent.filters.push(filter);

    this.coreCpMainMenuCmsUserGroupService.ServiceGetAll(filteModelContent).subscribe({
      next: (ret) => {
        this.dataCoreCpMainMenuCmsUserGroupModel = ret.listItems;
        const listG: number[] = [];
        this.dataCoreCpMainMenuCmsUserGroupModel.forEach(element => {
          listG.push(element.cmsUserGroup_Id);
        });
        this.dataCoreCpMainMenuIds = listG;
        if (ret.isSuccess) {
          this.formInfo.formAlert = '';
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );
  }

  DataEditContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName, this.translate.instant('MESSAGE.sending_information_to_the_server'));
    //! for convert color to hex
    this.dataModel.color = this.dataModel.color?.toString();
    this.coreCpMainMenuService.ServiceEdit(this.dataModel).subscribe({
      next: (ret) => {
        this.formInfo.formSubmitAllow = true;
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessEdit();
          this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );
  }
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.formSubmitAllow = false;
    this.DataEditContent();
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      if (!this.formGroup.valid) {
        this.cmsToastrService.typeErrorFormInvalid();
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
    }
  }
  onActionSelectorModuleSelect(model: CoreModuleModel): void {
    this.dataModel.linkModuleId = null;
    if (model && model.id > 0) {
      this.dataModel.linkModuleId = model.id;
    }
  }
  onActionSelectorSelect(model: CoreCpMainMenuModel): void {
    this.dataModel.linkParentId = null;
    if (model && model.id > 0) {
      this.dataModel.linkParentId = model.id;
    }
  }
  onActionSelectorUserCategorySelect(model: CoreUserGroupModel[]): void {
    this.dataCoreCpMainMenuModel = model;
  }
  onActionSelectorUserCategorySelectAdded(model: CoreUserGroupModel): void {
    const entity = new CoreCpMainMenuCmsUserGroupModel();
    entity.cmsUserGroup_Id = model.id;
    entity.cmsCpMainMenu_Id = this.dataModel.id;

    this.coreCpMainMenuCmsUserGroupService.ServiceAdd(entity).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_in_this_group_was_successful');
          this.cmsToastrService.typeSuccessEdit();
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
      }
    }
    );
  }
  onActionSelectorUserCategorySelectRemoved(model: CoreUserGroupModel): void {
    const entity = new CoreCpMainMenuCmsUserGroupModel();
    entity.cmsUserGroup_Id = model.id;
    entity.cmsCpMainMenu_Id = this.dataModel.id;

    this.coreCpMainMenuCmsUserGroupService.ServiceDeleteEntity(entity).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.Deletion_from_this_group_Was_Successful');
          this.cmsToastrService.typeSuccessEdit();
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
      }
    }
    );
  }
  onIconPickerSelect(model: any): void {
    this.dataModel.icon = model;
  }

}
