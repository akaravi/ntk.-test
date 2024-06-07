
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService, DataFieldInfoModel, DonateSponsorModel,
  DonateSponsorService, DonateTargetCategoryModel, ErrorExceptionResult,
  FormInfoModel
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-donate-sponser-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class DonateSponserAddComponent extends AddBaseComponent<DonateSponsorService, DonateSponsorModel, number> implements OnInit {
  requestLinkTargetCategoryId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DonateSponserAddComponent>,
    public coreEnumService: CoreEnumService,
    public donateSponsorService: DonateSponsorService,
    private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(donateSponsorService, new DonateSponsorModel(), publicHelper);
    this.loading.cdr = this.cdr; this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    if (data) {
      this.requestLinkTargetCategoryId = +data.linkTargetCategoryId || 0;
    }
    if (this.requestLinkTargetCategoryId > 0) {
      this.dataModel.linkTargetCategoryId = this.requestLinkTargetCategoryId;
    }
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  dataModelResult: ErrorExceptionResult<DonateSponsorModel> = new ErrorExceptionResult<DonateSponsorModel>();
  dataModel: DonateSponsorModel = new DonateSponsorModel();


  formInfo: FormInfoModel = new FormInfoModel();


  fileManagerOpenForm = false;

  ngOnInit(): void {
    this.formInfo.formTitle = this.translate.instant('TITLE.Register_New_Categories');

    this.DataGetAccess();
  }





  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    this.donateSponsorService.ServiceAdd(this.dataModel).subscribe({
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
  onActionSelectorSelect(model: DonateTargetCategoryModel | null): void {
    if (!model || model.id <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkTargetCategoryId = model.id;
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
