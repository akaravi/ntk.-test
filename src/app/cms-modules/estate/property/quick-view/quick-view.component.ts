
import {
  ChangeDetectorRef, Component, HostListener, Inject,
  OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService, DataFieldInfoModel, ErrorExceptionResult, EstateContractModel, EstateContractTypeModel, EstateContractTypeService, EstatePropertyModel,
  EstatePropertyService, FormInfoModel, InputDataTypeEnum, ManageUserAccessDataTypesEnum, TokenInfoModel
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-estate-property-quick-view',
  templateUrl: './quick-view.component.html',
})
export class EstatePropertyQuickViewComponent implements OnInit, OnDestroy {
  requestId = '';
  requestPerviousItem: any;
  requestNextItem: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EstatePropertyQuickViewComponent>,
    public coreEnumService: CoreEnumService,
    public estatePropertyService: EstatePropertyService,
    public estateContractTypeService: EstateContractTypeService,
    private cmsToastrService: CmsToastrService,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    public publicHelper: PublicHelper,
    public translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    if (data) {
      this.requestId = data.id + '';
      this.requestPerviousItem = data.perviousItem;
      this.requestNextItem = data.nextItem;

    }
  }

  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<EstatePropertyModel> = new ErrorExceptionResult<EstatePropertyModel>();
  dataModelEstateContractTypeResult: ErrorExceptionResult<EstateContractTypeModel> = new ErrorExceptionResult<EstateContractTypeModel>();
  dataModel: EstatePropertyModel = new EstatePropertyModel();
  formInfo: FormInfoModel = new FormInfoModel();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  loadingOption = new ProgressSpinnerModel();
  optionTabledataSource = new MatTableDataSource<EstateContractModel>();
  optionTabledisplayedColumns = ['LinkEstateContractTypeId', 'Price'];// 'SalePrice', 'DepositPrice', 'RentPrice', 'PeriodPrice'];
  fileManagerOpenForm = false;
  errorMessage: string = '';
  propertyTypeLanduse: string = '';
  contractType: string = '';
  propertyDetails: Map<string, string> = new Map<string, string>();
  enumInputDataType = InputDataTypeEnum;


  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.formInfo.formTitle = this.translate.instant('TITLE.QUICK_VIEW');
    if (this.requestId.length === 0) {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }
    this.DataGetOneContent();
    this.getEstateContractType();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      this.getEstateContractType();
    });
  }

  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // 37 - left
    // 38 - up
    // 39 - right
    // 40 - down
    if (event?.key === '39' || event?.key === 'ArrowRight')
      this.onActionNext();
    if (event?.key === '37' || event?.key === 'ArrowLeft')
      this.onActionPervious();
  }
  getEstateContractType(): void {
    const pName = this.constructor.name + 'getEstateContractType';
    this.loading.Start(pName, this.translate.instant('TITLE.Get_Estate_Contract_Type'));
    this.estateContractTypeService.ServiceGetAll(null).subscribe((next) => {
      this.dataModelEstateContractTypeResult = next;
      this.loading.Stop(pName);
    }, () => {
      this.loading.Stop(pName);
    });

  }

  DataGetOneContent(): void {
    this.translate.get('MESSAGE.Receiving_Information_From_The_Server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    /*َAccess Field*/
    this.estatePropertyService.setAccessLoad();
    this.estatePropertyService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
    this.estatePropertyService.ServiceGetOneById(this.requestId).subscribe({
      next: (ret) => {
        /*َAccess Field*/
        // this.dataAccessModel = next.access;
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
        this.dataModel = ret.item;
        this.propertyTypeLanduse = this.dataModel.propertyTypeLanduse?.titleML;
        if (ret.isSuccess) {
          this.optionTabledataSource.data = this.dataModel.contracts;

          this.formInfo.formTitle = this.formInfo.formTitle;
          this.formInfo.formAlert = '';
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
          this.translate.get('ERRORMESSAGE.MESSAGE.typeError').subscribe((str: string) => { this.formInfo.formAlert = str; });
          this.formInfo.formError = ret.errorMessage;
          this.errorMessage = ret.errorMessage + '<br> ( ' + ret.errorTypeTitle + ' ) ';
          this.cmsToastrService.typeErrorMessage(this.errorMessage);
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
  setStep(index: number): void {
    this.step = index;
  }
  step = 0;
  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
  onActionNext(): void {
    this.dialogRef.close({ dialogChangedDate: true, onActionOpenItem: this.requestNextItem });
  }
  onActionPervious(): void {
    this.dialogRef.close({ dialogChangedDate: true, onActionOpenItem: this.requestPerviousItem });
  }
}
