
import {
  ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  DataFieldInfoModel, DataProviderClientModel,
  DataProviderClientService, ErrorExceptionResult,
  RecordStatusEnum
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { CmsLinkToComponent } from 'src/app/shared/cms-link-to/cms-link-to.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-data-provider-client-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class DataProviderClientHeaderComponent implements OnInit, OnDestroy {
  constructor(
    private headerService: DataProviderClientService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private cmsToastrService: CmsToastrService,
    public dialog: MatDialog,
    public translate: TranslateService,
    public tokenHelper: TokenHelper
  ) {
    this.loading.cdr = this.cdr; this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
  }
  @Input() optionId = 0;
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<DataProviderClientModel> = new ErrorExceptionResult<DataProviderClientModel>();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();



  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    if (this.optionId > 0) {
      this.DataGetOneContent();
    }

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataGetOneContent();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }

  DataGetOneContent(): void {
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.headerService.setAccessLoad();
    this.headerService.ServiceGetOneById(this.optionId).subscribe({
      next: (ret) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
        if (ret.isSuccess) {
          this.dataModelResult = ret;
        } else {
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
  onActionButtonLinkTo(model: DataProviderClientModel = this.dataModelResult.item): void {
    if (!model || !model.id || model.id === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    if (model.recordStatus != RecordStatusEnum.Available) {
      this.cmsToastrService.typeWarningRecordStatusNoAvailable();
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    //open popup
    const dialogRef = this.dialog.open(CmsLinkToComponent, {
      height: "90%",
      width: "90%",
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: {
        // title: model.title,
        urlViewContentQRCodeBase64: '',
        urlViewContent: '',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.dialogChangedDate) {
      }
    });
    //open popup
  }
}
