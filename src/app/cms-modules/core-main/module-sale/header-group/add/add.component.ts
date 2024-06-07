import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService, CoreModuleSaleHeaderGroupModel, CoreModuleSaleHeaderGroupService, CoreSiteCategoryModel,
  CoreUserGroupModel, DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel
} from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-modulesaleheadergroup-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class CoreModuleSaleHeaderGroupAddComponent extends AddBaseComponent<CoreModuleSaleHeaderGroupService, CoreModuleSaleHeaderGroupModel, number> implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreModuleSaleHeaderGroupAddComponent>,
    public coreEnumService: CoreEnumService,
    public coreModuleSaleHeaderGroupService: CoreModuleSaleHeaderGroupService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(coreModuleSaleHeaderGroupService, new CoreModuleSaleHeaderGroupModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant('MESSAGE.Receiving_information');

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  dataModelResult: ErrorExceptionResult<CoreModuleSaleHeaderGroupModel> = new ErrorExceptionResult<CoreModuleSaleHeaderGroupModel>();
  dataModel: CoreModuleSaleHeaderGroupModel = new CoreModuleSaleHeaderGroupModel();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  @ViewChild('vform', { static: false }) formGroup: FormGroup;

  formInfo: FormInfoModel = new FormInfoModel();


  fileManagerOpenForm = false;




  ngOnInit(): void {

    this.formInfo.formTitle = this.translate.instant('TITLE.ADD');

    this.DataGetAccess();
  }





  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreModuleSaleHeaderGroupService.ServiceAdd(this.dataModel).subscribe({
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
  onActionFileSelected(model: NodeInterface): void {
    this.dataModel.linkMainImageId = model.id;
    this.dataModel.linkMainImageIdSrc = model.downloadLinksrc;
  }
  onActionSelectUserGroup(model: CoreUserGroupModel | null): void {
    if (!model || model.id <= 0) {
      this.dataModel.linkUserGroupId = null;
      return;
    }
    this.dataModel.linkUserGroupId = model.id;
  }
  onActionSelectSiteCategory(model: CoreSiteCategoryModel | null): void {
    if (!model || model.id <= 0) {
      this.dataModel.linkCmsSiteCategoryId = null;
      return;
    }
    this.dataModel.linkCmsSiteCategoryId = model.id;
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
