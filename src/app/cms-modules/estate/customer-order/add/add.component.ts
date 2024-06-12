
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef, Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreCurrencyModel, CoreEnumService, CoreUserModel, DataFieldInfoModel, EstateAccountAgencyModel, EstateAccountUserModel, EstateContractTypeModel, EstateCustomerCategoryModel, EstateCustomerOrderModel, EstateCustomerOrderService, EstatePropertyDetailGroupService, EstatePropertyDetailValueModel, EstatePropertyService, EstatePropertyTypeLanduseModel,
  EstatePropertyTypeUsageModel, FilterDataModel, FilterModel, FormInfoModel, InputDataTypeEnum, ManageUserAccessUserTypesEnum, RecordStatusEnum, SortTypeEnum, TokenInfoModel
} from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { environment } from 'src/environments/environment';
import { EstatePropertyListComponent } from '../../property/list/list.component';
import { EstateCustomerOrderActionComponent } from '../action/action.component';

@Component({
  selector: 'app-estate-customer-order-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class EstateCustomerOrderAddComponent extends AddBaseComponent<EstateCustomerOrderService, EstateCustomerOrderModel, string> implements OnInit {
  requestId = '';
  constructor(
    private router: Router,
    public coreEnumService: CoreEnumService,
    public estateCustomerOrderService: EstateCustomerOrderService,
    private estatePropertyService: EstatePropertyService,
    private cmsToastrService: CmsToastrService,
    public estatePropertyDetailGroupService: EstatePropertyDetailGroupService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    public tokenHelper: TokenHelper,
    public http: HttpClient,
    public dialog: MatDialog,
    public translate: TranslateService,
  ) {
    super(estateCustomerOrderService, new EstateCustomerOrderModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
    this.linkParentId = this.activatedRoute.snapshot.paramMap.get('LinkParentId');
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });
  }

  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  @ViewChild(EstatePropertyListComponent) estatePropertyList: EstatePropertyListComponent;

  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  numbers: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  enumInputDataType = InputDataTypeEnum;
  fileManagerTree: TreeModel;
  appLanguage = 'fa';
  tokenInfo = new TokenInfoModel();
  linkParentId = '';
  // dataModelResult: ErrorExceptionResult<EstateCustomerOrderModel> = new ErrorExceptionResult<EstateCustomerOrderModel>();
  dataModel: EstateCustomerOrderModel = new EstateCustomerOrderModel();
  dataModelCorCurrencySelector = new CoreCurrencyModel();
  formInfo: FormInfoModel = new FormInfoModel();

  fileManagerOpenForm = false;
  PropertyTypeSelected = new EstatePropertyTypeLanduseModel();
  propertyDetails: Map<string, string> = new Map<string, string>();
  contractTypeSelected: EstateContractTypeModel;
  optionloadComponent = false;
  LinkPropertyIdsInUse = false;


  // ** Accardon */
  step = 0;
  hidden = true;

  areaAddressView = false;
  ngOnInit(): void {
    this.translate.get('TITLE.ADD').subscribe((str: string) => { this.formInfo.formTitle = str; });

    this.DataGetAccess();
    this.DataGetAccessEstate();
    this.dataModel.caseCode = this.publicHelper.StringRandomGenerator(5, true);
    if (this.requestId && this.requestId.length > 0) {
      this.DataGetOneContent();
    }
    else if (this.linkParentId && this.linkParentId.length > 0) {
      this.dataModel.linkEstateCustomerCategoryId = this.linkParentId;
    }
  }

  dataFieldInfoModel: DataFieldInfoModel[];

  DataGetAccessEstate(): void {
    this.estatePropertyService
      .ServiceViewModel()
      .subscribe({
        next: (ret) => {
          if (ret.isSuccess) {
            this.dataFieldInfoModel = ret.access.fieldsInfo;
          } else {
            this.cmsToastrService.typeErrorGetAccess(ret.errorMessage);
          }
        },
        error: (er) => {
          this.cmsToastrService.typeErrorGetAccess(er);
        }
      }
      );

  }
  DataAddContent(): void {
    this.translate.get('MESSAGE.sending_information_to_the_server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.estateCustomerOrderService.ServiceAdd(this.dataModel).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.translate.get('MESSAGE.registration_completed_successfully').subscribe((str: string) => { this.formInfo.formAlert = str; });
          this.cmsToastrService.typeSuccessAdd();

          if ((this.tokenHelper.CheckIsAdmin() || this.tokenHelper.CheckIsSupport() || this.tokenHelper.tokenInfo.userAccessUserType == ManageUserAccessUserTypesEnum.ResellerCpSite || this.tokenHelper.tokenInfo.userAccessUserType == ManageUserAccessUserTypesEnum.ResellerEmployeeCpSite) && this.dataModel.recordStatus == RecordStatusEnum.Available) {
            var panelClass = '';
            if (this.tokenHelper.isMobile)
              panelClass = 'dialog-fullscreen';
            else
              panelClass = 'dialog-min';
            const dialogRef = this.dialog.open(EstateCustomerOrderActionComponent, {
              panelClass: panelClass,
              enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
              exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
              data: { model: ret.item }
            });
            dialogRef.afterClosed().subscribe(result => {
              this.router.navigate(['/estate/customer-order/edit', ret.item.id]);
            });
          }



        } else {
          this.translate.get('ERRORMESSAGE.MESSAGE.typeError').subscribe((str: string) => { this.formInfo.formAlert = str; });
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
      }
    }
    );

  }

  DataGetOneContent(): void {
    this.translate.get('MESSAGE.Receiving_Information_From_The_Server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    // var id = '';
    // if (this.dataModelResult && this.dataModelResult.item && this.dataModelResult.item.id && this.dataModelResult.item.id.length > 0) {
    //   id = this.dataModelResult.item.id;
    // } else if (this.requestId && this.requestId.length > 0) {
    //   id = this.requestId;
    // }
    this.estateCustomerOrderService.setAccessLoad();
    this.estateCustomerOrderService.ServiceGetOneById(this.requestId).subscribe({
      next: (ret) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);

        this.dataModel = ret.item;
        if (ret.isSuccess) {
          this.formInfo.formTitle = this.formInfo.formTitle + ' ' + ret.item.title;
          this.formInfo.formAlert = '';
        } else {
          this.translate.get('ERRORMESSAGE.MESSAGE.typeError').subscribe((str: string) => { this.formInfo.formAlert = str; });
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

  DataGetPropertyDetailGroup(id: string): void {
    const filteModelProperty = new FilterModel();
    const filter = new FilterDataModel();
    filter.propertyName = 'LinkPropertyTypeLanduseId';
    filter.value = id;
    filteModelProperty.filters.push(filter);
    this.dataModel.propertyDetailGroups = [];
    const pName = this.constructor.name + 'DataGetPropertyDetailGroup';
    this.loading.Start(pName, this.translate.instant('MESSAGE.Get_detailed_information'));
    this.estatePropertyDetailGroupService.ServiceGetAll(filteModelProperty)
      .subscribe({
        next: (ret) => {
          if (ret.isSuccess) {
            this.dataModel.propertyDetailGroups = ret.listItems;
            /** load Value */
            if (this.dataModel.propertyDetailGroups)
              this.dataModel.propertyDetailGroups.forEach(itemGroup => {
                itemGroup.propertyDetails.forEach(element => {
                  this.propertyDetails[element.id] = 0;

                  if (this.dataModel.propertyDetailValues) {
                    const value = this.dataModel.propertyDetailValues.find(x => x.linkPropertyDetailId === element.id);
                    if (value) {
                      this.propertyDetails[element.id] = value.value;
                    }
                  }
                });
              });
            /** load Value */
          } else {
            this.cmsToastrService.typeErrorGetAccess(ret.errorMessage);
          }
          this.loading.Stop(pName);
        },
        error: (er) => {
          this.cmsToastrService.typeErrorGetAccess(er);
          this.loading.Stop(pName);
        }
      }
      );
  }
  onActionSelectorSelectUsage(model: EstatePropertyTypeUsageModel | null): void {
    if (!model || !model.id || model.id.length <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeWarningSelected(message);
      return;
    }
    this.dataModel.linkPropertyTypeUsageId = model.id;
  }
  onActionSelectorEstateAgency(model: EstateAccountAgencyModel | null): void {
    this.dataModel.linkEstateAgencyId = null;
    if (!model || !model.id || model.id.length <= 0) {
      return;
    }
    this.dataModel.linkEstateAgencyId = model.id;
  }
  onActionSelectorSelectLanduse(model: EstatePropertyTypeLanduseModel | null): void {
    this.PropertyTypeSelected = null;
    this.dataModel.linkPropertyTypeLanduseId = null;
    if (!model || !model.id || model.id.length <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeWarningSelected(message);
      return;
    }
    this.PropertyTypeSelected = model;
    this.dataModel.linkPropertyTypeLanduseId = model.id;
    this.DataGetPropertyDetailGroup(model.id);
  }
  onActionSelectorEstateUser(model: EstateAccountUserModel | null): void {
    this.dataModel.linkEstateUserId = null;
    if (!model || !model.id || model.id.length <= 0) {
      return;
    }
    this.dataModel.linkEstateUserId = model.id;
  }

  onActionSelectorContarctType(model: EstateContractTypeModel | null): void {
    this.contractTypeSelected = null;
    this.dataModel.linkContractTypeId = null;
    if (!model || !model.id || model.id.length <= 0) {
      const message = this.translate.instant('MESSAGE.Type_of_property_transaction_is_not_known');
      this.cmsToastrService.typeWarningSelected(message);
      return;
    }
    this.contractTypeSelected = model;
    this.dataModel.linkContractTypeId = model.id;

  }
  onActionSelectorLocation(model: number[] | null): void {

    this.dataModel.linkLocationIds = model;
  }
  onActionSelectorProperty(model: string[] | null): void {
    this.dataModel.linkPropertyIds = model;
    if (this.dataModel.linkPropertyIds && this.dataModel.linkPropertyIds.length > 0) {
      this.LinkPropertyIdsInUse = true;
    } else {
      this.LinkPropertyIdsInUse = false;
    }
  }
  onActionSelectorPropertyIgnored(model: string[] | null): void {
    this.dataModel.linkPropertyIdsIgnored = model;

  }
  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }
  // ** Accardon */
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.formSubmitAllow = false;
    // ** Save Value */
    this.dataModel.propertyDetailValues = [];
    if (this.dataModel.propertyDetailGroups)
      this.dataModel.propertyDetailGroups.forEach(itemGroup => {
        itemGroup.propertyDetails.forEach(element => {
          const value = new EstatePropertyDetailValueModel();
          value.linkPropertyDetailId = element.id;
          value.value = this.propertyDetails[element.id];
          this.dataModel.propertyDetailValues.push(value);
        });
      });
    // ** Save Value */

    this.DataAddContent();

  }

  onActionSelectorSelect(model: EstateCustomerCategoryModel | null): void {
    if (!model || model.id.length <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkEstateCustomerCategoryId = model.id;
  }
  onFormCancel(): void {
    this.router.navigate(['/estate/customer-order/']);
  }

  onActionSelectCurrency(model: CoreCurrencyModel): void {
    if (!model || model.id <= 0) {
      // this.cmsToastrService.typeErrorSelected();
      this.dataModelCorCurrencySelector = null;
      this.dataModel.linkCoreCurrencyId = null;
      return;
    }
    this.dataModelCorCurrencySelector = model;
    this.dataModel.linkCoreCurrencyId = model.id;
  }
  onActionSelectorCmsUser(model: CoreUserModel | null): void {
    if (!model || !model.id || model.id <= 0) {
      //  const message = this.translate.instant('MESSAGE.Information_user_is_not_clear');
      //  this.cmsToastrService.typeErrorSelected(message);
      this.dataModel.linkCmsUserId = null;
      return;
    }
    this.dataModel.linkCmsUserId = model.id;
  }
  onActionSortArrow() {
    if (this.dataModel.resultSortType == SortTypeEnum.Ascending)
      this.dataModel.resultSortType = SortTypeEnum.Descending;
    else if (this.dataModel.resultSortType == SortTypeEnum.Descending)
      this.dataModel.resultSortType = SortTypeEnum.Random;
    else if (this.dataModel.resultSortType == SortTypeEnum.Random)
      this.dataModel.resultSortType = SortTypeEnum.Ascending;
    else
      this.dataModel.resultSortType = SortTypeEnum.Ascending;
  }
}
