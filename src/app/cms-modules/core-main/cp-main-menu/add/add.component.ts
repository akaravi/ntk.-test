
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreCpMainMenuModel, CoreCpMainMenuService, CoreEnumService, DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel, InfoEnumModel, TokenInfoModel
} from 'ntk-cms-api';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-user-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class CoreCpMainMenuAddComponent extends AddBaseComponent<CoreCpMainMenuService, CoreCpMainMenuModel, number> implements OnInit {
  requestParentId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreCpMainMenuAddComponent>,
    public coreEnumService: CoreEnumService,
    public coreCpMainMenuService: CoreCpMainMenuService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public tokenHelper: TokenHelper,
  ) {
    super(coreCpMainMenuService, new CoreCpMainMenuModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    if (data) {
      this.requestParentId = +data.parentId || 0;
    }
    if (this.requestParentId > 0) {
      this.dataModel.linkParentId = this.requestParentId;
    }
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  dataModelResult: ErrorExceptionResult<CoreCpMainMenuModel> = new ErrorExceptionResult<CoreCpMainMenuModel>();
  dataModel: CoreCpMainMenuModel = new CoreCpMainMenuModel();
  formInfo: FormInfoModel = new FormInfoModel();

  dataModelEnumMenuPlaceTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  fileManagerOpenForm = false;
  tokenInfo = new TokenInfoModel();
  ngOnInit(): void {

    this.formInfo.formTitle = this.translate.instant('TITLE.ADD');

    this.getEnumMenuPlaceType();
    this.DataGetAccess();

  }
  getEnumMenuPlaceType(): void {
    this.coreEnumService.ServiceMenuPlaceTypeEnum().subscribe((next) => {
      this.dataModelEnumMenuPlaceTypeResult = next;
    });
  }

  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreCpMainMenuService.ServiceAdd(this.dataModel).subscribe({
      next: (ret) => {
        this.formInfo.formSubmitAllow = true;
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessAdd();
          this.dialogRef.close({ dialogChangedDate: true, model: ret.item });

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
  onActionSelectorSelect(model: CoreCpMainMenuModel): void {
    this.dataModel.linkParentId = null;
    if (model && model.id > 0) {
      this.dataModel.linkParentId = model.id;
    }
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
