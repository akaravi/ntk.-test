
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
  ApplicationAppModel, ApplicationSourceModel, CoreEnumService, CoreModuleModel, CoreSiteCategoryModel, CoreUserClaimGroupDetailModel, CoreUserClaimGroupDetailService, CoreUserClaimGroupModel, CoreUserClaimGroupService, CoreUserClaimTypeModel, CoreUserGroupModel,
  ErrorExceptionResult, ErrorExceptionResultBase, FilterDataModel, FilterModel, FormInfoModel, InfoEnumModel, ManageUserAccessDataTypesEnum
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { EditBaseComponent } from 'src/app/core/cmsComponent/editBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-userclaimgroup-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreUserClaimGroupEditComponent extends EditBaseComponent<CoreUserClaimGroupService, CoreUserClaimGroupModel, number>
  implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimGroupEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimGroupService: CoreUserClaimGroupService,
    public coreUserClaimGroupDetailService: CoreUserClaimGroupDetailService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(coreUserClaimGroupService, new CoreUserClaimGroupModel(), publicHelper);

    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    if (data) {
      this.requestId = +data.id || 0;
    }

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;


  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';


  dataModelResult: ErrorExceptionResultBase = new ErrorExceptionResultBase();
  dataModel: CoreUserClaimGroupModel = new CoreUserClaimGroupModel();

  formInfo: FormInfoModel = new FormInfoModel();

  dataModelEnumUserClaimGroupActionTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();

  fileManagerOpenForm = false;
  dataCoreUserClaimTypeModels: CoreUserClaimTypeModel[];
  dataCoreClaimTypeIds: number[] = [];
  dataCoreUserClaimGroupDetailModels: CoreUserClaimGroupDetailModel[];


  ngOnInit(): void {
    if (this.requestId > 0) {
      this.translate.get('TITLE.Edit').subscribe((str: string) => { this.formInfo.formTitle = str; });
      this.DataGetOneContent();
    } else {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }


    this.getEnumUserClaimGroupActionType();
    this.DataGetAllCoreUserClaimType();

  }
  getEnumUserClaimGroupActionType(): void {
    this.coreEnumService.ServiceUserClaimGroupActionTypeEnum().subscribe((next) => {
      this.dataModelEnumUserClaimGroupActionTypeResult = next;
    });
  }

  DataGetOneContent(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.formAlert = this.translate.instant('MESSAGE.Receiving_Information_From_The_Server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'DataGetOneContent';
    this.loading.Start(pName, this.translate.instant('MESSAGE.Receive_categories_of_documents'));

    this.coreUserClaimGroupService.setAccessLoad();
    this.coreUserClaimGroupService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
    this.coreUserClaimGroupService.ServiceGetOneById(this.requestId).subscribe({
      next: (ret) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);

        this.dataModel = ret.item;
        if (ret.isSuccess) {
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

  DataEditContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName, this.translate.instant('MESSAGE.Registration_of categories_of_documents'));
    this.coreUserClaimGroupService.ServiceEdit(this.dataModel).subscribe({
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
  onActionSelectApplication(model: ApplicationAppModel | null): void {
    if (!model || model.id <= 0) {
      this.dataModel.linkApplicationId = null;
      return;
    }
    this.dataModel.linkApplicationId = model.id;
  }
  onActionSelectApplicationSource(model: ApplicationSourceModel | null): void {
    if (!model || model.id <= 0) {
      this.dataModel.linkApplicationSourceId = null;
      return;
    }
    this.dataModel.linkApplicationSourceId = model.id;
  }
  onActionSelectUserGroup(model: CoreUserGroupModel | null): void {
    if (!model || model.id <= 0) {
      this.dataModel.linkUserGroupId = null;
      return;
    }
    this.dataModel.linkUserGroupId = model.id;
  }
  onActionSelectSiteCategory(model: CoreSiteCategoryModel | null): void {
    this.dataModel.linkSiteCategoryId = null;
    if (!model || model.id <= 0) {
      this.dataModel.linkSiteCategoryId = null;
      return;
    }
    this.dataModel.linkSiteCategoryId = model.id;
  }
  onActionSelectModuleId(model: CoreModuleModel | null): void {
    this.dataModel.linkModuleId = null;
    if (!model || model.id <= 0) {
      return;
    }
    this.dataModel.linkModuleId = model.id;
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
  DataGetAllCoreUserClaimType(): void {

    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.formAlert = this.translate.instant('MESSAGE.Receiving_Information_From_The_Server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'DataGetAllCoreUserClaimType'
    this.loading.Start(pName, this.translate.instant('MESSAGE.Receive_categories_of_documents'));

    const filteModelContent = new FilterModel();
    const filter = new FilterDataModel();
    filter.propertyName = 'LinkUserClaimGroupId';
    filter.value = this.requestId;
    filteModelContent.filters.push(filter);

    this.coreUserClaimGroupDetailService.ServiceGetAll(filteModelContent).subscribe({
      next: (ret) => {
        this.dataCoreUserClaimGroupDetailModels = ret.listItems;
        const listG: number[] = [];
        this.dataCoreUserClaimGroupDetailModels.forEach(element => {
          listG.push(element.linkUserClaimTypeId);
        });
        this.dataCoreClaimTypeIds = listG;
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
  onActionSelectorUserCategorySelect(model: CoreUserClaimTypeModel[]): void {
    this.dataCoreUserClaimTypeModels = model;
  }
  onActionSelectorUserCategorySelectAdded(model: CoreUserClaimTypeModel): void {
    const entity = new CoreUserClaimGroupDetailModel();
    entity.linkUserClaimTypeId = model.id;
    entity.linkUserClaimGroupId = this.dataModel.id;
    entity.isRequired = true;

    this.coreUserClaimGroupDetailService.ServiceAdd(entity).subscribe({
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
  onActionSelectorUserCategorySelectRemoved(model: CoreUserClaimTypeModel): void {
    const entity = new CoreUserClaimGroupDetailModel();
    entity.linkUserClaimTypeId = model.id;
    entity.linkUserClaimGroupId = this.dataModel.id;

    this.coreUserClaimGroupDetailService.ServiceDeleteEntity(entity).subscribe({
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
}
