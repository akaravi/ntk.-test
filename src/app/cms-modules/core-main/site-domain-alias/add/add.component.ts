
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService, CoreSiteDomainAliasModel, CoreSiteDomainAliasService, CoreSiteModel,
  DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel
} from 'ntk-cms-api';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-core-site-domainalias-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class CoreSiteDomainAliasAddComponent extends AddBaseComponent<CoreSiteDomainAliasService, CoreSiteDomainAliasModel, number> implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreSiteDomainAliasAddComponent>,
    public coreEnumService: CoreEnumService,
    public coreSiteDomainAliasService: CoreSiteDomainAliasService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(coreSiteDomainAliasService, new CoreSiteDomainAliasModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    if (data) {
      this.requestId = +data.id || 0;
    }
    if (this.requestId > 0) {
      this.dataModel.linkCmsSiteId = this.requestId;
    }
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();


  dataModelResult: ErrorExceptionResult<CoreSiteDomainAliasModel> = new ErrorExceptionResult<CoreSiteDomainAliasModel>();
  dataModel: CoreSiteDomainAliasModel = new CoreSiteDomainAliasModel();


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

    this.coreSiteDomainAliasService.ServiceAdd(this.dataModel).subscribe({
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
          this.cmsToastrService.typeErrorAdd(ret.errorMessage);
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
    if (!this.dataModel.linkCmsSiteId || this.dataModel.linkCmsSiteId <= 0) {
      this.cmsToastrService.typeErrorAdd(this.translate.instant('MESSAGE.Website_ID_is_not_specified'));
      return;
    }
    this.formInfo.formSubmitAllow = false;
    this.DataAddContent();
  }
  onActionSiteSelect(model: CoreSiteModel): void {
    this.dataModel.linkCmsSiteId = null;
    if (model && model.id > 0) {
      this.dataModel.linkCmsSiteId = model.id;
    }
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
}