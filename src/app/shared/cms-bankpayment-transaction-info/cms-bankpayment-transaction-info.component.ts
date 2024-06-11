import {
  ChangeDetectorRef, Component, Inject, Input, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  BankPaymentEnumService, BankPaymentTransactionModel, BankPaymentTransactionService, ErrorExceptionResult, InfoEnumModel, TransactionRecordStatusEnum
} from 'ntk-cms-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-cms-bankpayment-transaction-info',
  templateUrl: './cms-bankpayment-transaction-info.component.html',
  styleUrls: ['./cms-bankpayment-transaction-info.component.scss'],
})
export class CmsBankpaymentTransactionInfoComponent implements OnInit {
  static nextId = 0;
  id = ++CmsBankpaymentTransactionInfoComponent.nextId;
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public bankPaymentTransactionService: BankPaymentTransactionService,
    private dialogRef: MatDialogRef<CmsBankpaymentTransactionInfoComponent>,
    private bankPaymentEnumService: BankPaymentEnumService,
    private cmsToastrService: CmsToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    public publicHelper: PublicHelper,
  ) {
    this.loading.cdr = this.cdr; this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    if (data) {
      this.requestId = + data.id || 0;
    }

  }
  loading: ProgressSpinnerModel = new ProgressSpinnerModel();
  get optionLoading(): ProgressSpinnerModel {
    return this.loading;
  }
  @Input() set optionLoading(value: ProgressSpinnerModel) {
    this.loading = value;
  }
  dataModelResult: ErrorExceptionResult<BankPaymentTransactionModel> = new ErrorExceptionResult<BankPaymentTransactionModel>();
  dataModelEnumTransactionRecordStatusResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();

  ngOnInit(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }
    this.DataGeOne();
    this.getEnumTransactionRecordStatus();
  }
  getEnumTransactionRecordStatus(): void {
    this.bankPaymentEnumService.ServiceTransactionRecordStatusEnum().subscribe((next) => {
      this.dataModelEnumTransactionRecordStatusResult = next;
    });
  }
  TransactionSuccessful = TransactionRecordStatusEnum.TransactionSuccessful;
  DataGeOne(): void {
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.bankPaymentTransactionService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        if (next.isSuccess) {
          this.dataModelResult = next;

        }
        else {
          this.cmsToastrService.typeErrorMessage(next.errorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: true });
  }
}
