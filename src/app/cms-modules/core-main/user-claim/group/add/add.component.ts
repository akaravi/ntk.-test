
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ApplicationAppModel, ApplicationSourceModel, CoreEnumService, CoreModuleModel, CoreSiteCategoryModel, CoreUserClaimGroupModel, CoreUserClaimGroupService, CoreUserGroupModel, DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel, InfoEnumModel
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-userclaimgroup-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class CoreUserClaimGroupAddComponent extends AddBaseComponent<CoreUserClaimGroupService, CoreUserClaimGroupModel, number> implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimGroupAddComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimGroupService: CoreUserClaimGroupService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(coreUserClaimGroupService, new CoreUserClaimGroupModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  dataModelResult: ErrorExceptionResult<CoreUserClaimGroupModel> = new ErrorExceptionResult<CoreUserClaimGroupModel>();
  dataModel: CoreUserClaimGroupModel = new CoreUserClaimGroupModel();


  formInfo: FormInfoModel = new FormInfoModel();

  dataModelEnumUserClaimGroupActionTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();

  fileManagerOpenForm = false;




  ngOnInit(): void {

    this.translate.get('TITLE.ADD').subscribe((str: string) => { this.formInfo.formTitle = str; });

    this.DataGetAccess();
    this.getEnumUserClaimGroupActionType();
  }
  getEnumUserClaimGroupActionType(): void {
    this.coreEnumService.ServiceUserClaimGroupActionTypeEnum().subscribe((next) => {
      this.dataModelEnumUserClaimGroupActionTypeResult = next;
    });
  }




  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreUserClaimGroupService.ServiceAdd(this.dataModel).subscribe({
      next: (ret) => {
        this.formInfo.formSubmitAllow = true;
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessAdd();
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

    this.DataAddContent();


  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
}
