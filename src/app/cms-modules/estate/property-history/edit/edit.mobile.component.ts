import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService,
  DataFieldInfoModel,
  ErrorExceptionResult,
  ErrorExceptionResultBase,
  EstateAccountAgencyModel,
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
  ManageUserAccessDataTypesEnum
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { EditBaseComponent } from 'src/app/core/cmsComponent/editBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { EstatePropertyHistoryEditComponent } from './edit.component';

@Component({
  selector: 'app-estate-property-history-edit-mobile',
  templateUrl: './edit.mobile.component.html',
  styleUrls: ['./edit.mobile.component.scss'],
})
export class EstatePropertyHistoryEditMobileComponent extends EditBaseComponent<EstatePropertyHistoryService, EstatePropertyHistoryModel, string>
  implements OnInit {
  requestId = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EstatePropertyHistoryEditComponent>,
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
    super(estatePropertyHistoryService, new EstatePropertyHistoryModel(), publicHelper);

    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant(
      'MESSAGE.Receiving_information'
    );
    if (data) {
      this.requestId = data.id;
    }
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

  }

  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<
    string,
    DataFieldInfoModel
  >();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerTree: TreeModel;
  appLanguage = 'fa';


  dataModelResult: ErrorExceptionResultBase = new ErrorExceptionResultBase();
  dataModel: EstatePropertyHistoryModel = new EstatePropertyHistoryModel();
  dataFileModelFiles = new Map<number, string>();
  formInfo: FormInfoModel = new FormInfoModel();
  fileManagerOpenForm = false;
  date = new FormControl(new Date());
  dataModelEstateActivityStatusEnumResult: ErrorExceptionResult<InfoEnumModel> =
    new ErrorExceptionResult<InfoEnumModel>();
  dataModelActivityTypeResult: ErrorExceptionResult<EstateActivityTypeModel> =
    new ErrorExceptionResult<EstateActivityTypeModel>();
  stepContent = 'title';
  step = 0;
  ngOnInit(): void {
    this.formInfo.formTitle = this.translate.instant('TITLE.Edit');
    if (!this.requestId || this.requestId.length === 0) {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }
    this.DataGetOneContent();

    this.getEstateActivityStatusEnum();
    this.DataGetAllActivityType();
  }

  getEstateActivityStatusEnum(): void {
    this.estateEnumService
      .ServiceEstateActivityStatusEnum()
      .subscribe((next) => {
        this.dataModelEstateActivityStatusEnumResult = next;
      });
  }
  DataGetOneContent(): void {
    this.formInfo.formAlert = this.translate.instant(
      'MESSAGE.Receiving_Information_From_The_Server'
    );
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.estatePropertyHistoryService.setAccessLoad();
    this.estatePropertyHistoryService.setAccessDataType(
      ManageUserAccessDataTypesEnum.Editor
    );
    this.estatePropertyHistoryService
      .ServiceGetOneById(this.requestId)
      .subscribe({
        next: (ret) => {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);

          this.dataModel = ret.item;
          if (ret.isSuccess) {
            this.formInfo.formTitle =
              this.formInfo.formTitle + ' ' + ret.item.title;
            this.formInfo.formAlert = '';

            /*
             * check file attach list
             */
            if (
              this.dataModel.linkFileIds &&
              this.dataModel.linkFileIds.length > 0
            ) {
              this.dataModel.linkFileIds
                .split(',')
                .forEach((element, index) => {
                  let link = '';
                  if (
                    this.dataModel.linkFileIdsSrc.length >=
                    this.dataModel.linkFileIdsSrc.length
                  ) {
                    link = this.dataModel.linkFileIdsSrc[index];
                  }
                  this.dataFileModelFiles.set(+element, link);
                });
            }
          } else {
            this.formInfo.formAlert = this.translate.instant(
              'ERRORMESSAGE.MESSAGE.typeError'
            );
            this.formInfo.formError = ret.errorMessage;
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
  DataEditContent(): void {
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
    this.loading.Start(
      pName,
      this.translate.instant('MESSAGE.sending_information_to_the_server')
    );

    this.estatePropertyHistoryService.ServiceEdit(this.dataModel).subscribe({
      next: (ret) => {
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant(
            'MESSAGE.registration_completed_successfully'
          );
          this.cmsToastrService.typeSuccessEdit();
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
  onActionSelectorEstateUser(model: EstateAccountUserModel | null): void {
    this.dataModel.linkEstateUserId = null;
    if (model && model.id.length > 0) {
      this.dataModel.linkEstateUserId = model.id;
    }
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
  onActionSelectorEstateAgency(model: EstateAccountAgencyModel | null): void {
    this.dataModel.linkEstateAgencyId = null;
    if (!model || !model.id || model.id.length <= 0) {
      return;
    }
    this.dataModel.linkEstateAgencyId = model.id;
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
  onFormSubmit(): void {
    this.formInfo.formSubmitAllow = false;
    this.DataEditContent();
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
