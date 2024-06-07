import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService,
  DataFieldInfoModel,
  ErrorExceptionResult,
  EstateAccountUserModel,
  EstateActivityTypeModel,
  EstateActivityTypeService,
  EstateCustomerOrderModel,
  EstateEnumService,
  EstatePropertyHistoryModel,
  EstatePropertyHistoryService,
  EstatePropertyModel,
  FilterModel,
  FormInfoModel,
  InfoEnumModel,
  TokenInfoModel,
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { EstatePropertyHistoryAddComponent } from './add.component';

@Component({
  selector: 'app-estate-property-history-add-mobile',
  templateUrl: './add.mobile.component.html',
  styleUrls: ['./add.mobile.component.scss'],
})
export class EstatePropertyHistoryAddMobileComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EstatePropertyHistoryAddComponent>,
    public coreEnumService: CoreEnumService,
    public estatePropertyHistoryService: EstatePropertyHistoryService,
    public estateActivityTypeService: EstateActivityTypeService,
    private cmsToastrService: CmsToastrService,
    public estateEnumService: EstateEnumService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    public tokenHelper: TokenHelper,
    public translate: TranslateService
  ) {
    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant(
      'MESSAGE.Receiving_information'
    );
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    if (data) {
      this.dataModel.linkActivityTypeId = data.linkActivityTypeId;
      this.dataModel.linkPropertyId = data.linkPropertyId;
      this.dataModel.linkEstateUserId = data.linkEstateUserId;
      this.dataModel.linkCustomerOrderId = data.linkCustomerOrderId;
      this.dataModel.linkEstateAgencyId = data.linkEstateAgencyId;
    }
  }

  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<
    string,
    DataFieldInfoModel
  >();
  stepContent = 'title';
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerTree: TreeModel;
  appLanguage = 'fa';
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<EstatePropertyHistoryModel> =
    new ErrorExceptionResult<EstatePropertyHistoryModel>();
  dataModelActivityTypeResult: ErrorExceptionResult<EstateActivityTypeModel> =
    new ErrorExceptionResult<EstateActivityTypeModel>();
  dataModel: EstatePropertyHistoryModel = new EstatePropertyHistoryModel();
  dataFileModelFiles = new Map<number, string>();
  formInfo: FormInfoModel = new FormInfoModel();
  fileManagerOpenForm = false;
  date = new FormControl(new Date());
  dataModelEstateActivityStatusEnumResult: ErrorExceptionResult<InfoEnumModel> =
    new ErrorExceptionResult<InfoEnumModel>();
  ngOnInit(): void {
    this.formInfo.formTitle = this.translate.instant('TITLE.ADD');

    this.DataGetAccess();
    this.getEstateActivityStatusEnum();
  }

  getEstateActivityStatusEnum(): void {
    this.estateEnumService
      .ServiceEstateActivityStatusEnum()
      .subscribe((next) => {
        this.dataModelEstateActivityStatusEnumResult = next;
      });
  }

  DataGetAccess(): void {
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.estatePropertyHistoryService.ServiceViewModel().subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
        } else {
          this.cmsToastrService.typeErrorGetAccess(ret.errorMessage);
        }
        this.loading.Stop(pName);
      },
      error: (er) => {
        this.cmsToastrService.typeErrorGetAccess(er);
        this.loading.Stop(pName);
      },
    });
  }
  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant(
      'MESSAGE.sending_information_to_the_server'
    );
    this.formInfo.formError = '';

    if (this.dataFileModelFiles) {
      const keys = Array.from(this.dataFileModelFiles.keys());
      if (keys && keys.length > 0) {
        this.dataModel.linkFileIds = keys.join(',');
      }
    }

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.estatePropertyHistoryService.ServiceAdd(this.dataModel).subscribe({
      next: (ret) => {
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant(
            'MESSAGE.registration_completed_successfully'
          );
          this.cmsToastrService.typeSuccessAdd();
          this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.formAlert = this.translate.instant(
            'ERRORMESSAGE.MESSAGE.typeError'
          );
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);

        this.formInfo.formSubmitAllow = true;
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      },
    });
  }

  DataGetAllActivityType(): void {
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    const filterModel = new FilterModel();
    this.estateActivityTypeService.ServiceGetAll(filterModel).subscribe({
      next: (ret) => {
        this.dataModelActivityTypeResult = ret;
        if (!ret.isSuccess) {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      },
    });
  }
  onActionSelectorSelect(model: EstateActivityTypeModel | null): void {
    if (!model || model.id.length <= 0) {
      const message = this.translate.instant(
        'MESSAGE.category_of_information_is_not_clear'
      );
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkActivityTypeId = model.id;
  }

  onActionSelectorEstateUser(model: EstateAccountUserModel | null): void {
    this.dataModel.linkEstateUserId = null;
    if (model && model.id.length > 0) {
      this.dataModel.linkEstateUserId = model.id;
    }
  }
  onActionSelectorEstateAgency(model: EstateAccountUserModel | null): void {
    this.dataModel.linkEstateAgencyId = null;
    if (!model || !model.id || model.id.length <= 0) {
      return;
    }
    this.dataModel.linkEstateAgencyId = model.id;
  }
  onActionSelectorProperty(model: EstatePropertyModel | null): void {
    this.dataModel.linkPropertyId = null;
    if (model && model.id.length > 0) {
      this.dataModel.linkPropertyId = model.id;
    }
  }
  onActionSelectorCustomerOrderId(
    model: EstateCustomerOrderModel | null
  ): void {
    this.dataModel.linkCustomerOrderId = null;
    if (model && model.id.length > 0) {
      this.dataModel.linkCustomerOrderId = model.id;
    }
  }
  onFormSubmit(): void {
    this.formInfo.formSubmitAllow = false;
    this.DataAddContent();
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
  onActoinSelectStepNext(step: string): void {
    this.stepContent = step;
  }
  onActoinSelectStepBefor(step: string): void {
    this.stepContent = step;
  }
}
