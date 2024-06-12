import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccessModel, ApplicationSourceModel, CaptchaModel, CoreAuthService, CoreEnumService, FormInfoModel, FormSubmitedStatusEnum, TicketingTaskDtoModel, TicketingTaskModel, TicketingTaskService, TicketingTemplateModel } from 'ntk-cms-api';
import { TreeModel } from 'ntk-cms-filemanager';
import { Subscription } from 'rxjs';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { PoinModel } from 'src/app/core/models/pointModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { PageInfoService } from 'src/app/core/services/page-info.service';

@Component({
  selector: 'app-page-contactus',
  templateUrl: './page-contactus.component.html',
})

export class PageContactusComponent extends AddBaseComponent<TicketingTaskService, TicketingTaskModel, number> implements OnInit {
  requestLinkDepartemenId = 0;
  constructor(
    private tokenHelper: TokenHelper,
    private activatedRoute: ActivatedRoute,
    private coreAuthService: CoreAuthService,
    public publicHelper: PublicHelper,
    public coreEnumService: CoreEnumService,
    private ticketingTaskService: TicketingTaskService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    public translate: TranslateService,
    public pageInfo: PageInfoService,
    private cdr: ChangeDetectorRef) {
    super(ticketingTaskService, new TicketingTaskModel(), publicHelper);
    this.loading.cdr = this.cdr; this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      this.dataModel.fullName = this.tokenInfo.fullName;
      this.dataModel.email = this.tokenInfo.email;
      this.dataModel.phoneNo = this.tokenInfo.mobile;
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      this.dataModel.fullName = this.tokenInfo.fullName;
      this.dataModel.email = this.tokenInfo.email;
      this.dataModel.phoneNo = this.tokenInfo.mobile;
    });
  }
  cmsApiStoreSubscribe: Subscription;
  // tokenInfo: TokenInfoModel;


  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  //fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  formInfo: FormInfoModel = new FormInfoModel();
  dataAccessModel: AccessModel;
  dataModel = new TicketingTaskDtoModel();
  //dataModelResult: ErrorExceptionResult<TicketingTaskModel> = new ErrorExceptionResult<TicketingTaskModel>();


  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerOpenForm = false;
  appLanguage = 'fa';
  templateItemCount = 0;
  fileManagerTree: TreeModel;
  mapMarker: any;
  mapOptonCenter = new PoinModel();
  captchaModel: CaptchaModel = new CaptchaModel();
  expireDate: Date;
  aoutoCaptchaOrder = 1;
  enumFormSubmitedStatus = FormSubmitedStatusEnum;
  onCaptchaOrderInProcess = false;
  ngOnInit(): void {
    this.pageInfo.updateTitle(this.translate.instant('ACTION.CONTACT'));
    this.requestLinkDepartemenId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkDepartemenId'));
    this.onCaptchaOrder();

    this.dataModel.linkTicketingDepartemenId = this.requestLinkDepartemenId;
    this.DataGetAccess();

  }

  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }

    this.DataAddContent();
  }

  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataAddContent(): void {
    this.formInfo.formSubmitAllow = false;
    this.translate.get('MESSAGE.sending_information_to_the_server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.dataModel.captchaKey = this.captchaModel.key;
    this.ticketingTaskService
      .ServiceContactUS(this.dataModel)
      .subscribe(
        async (next) => {

          this.formInfo.formSubmitAllow = !next.isSuccess;
          this.dataModelResult = next;
          if (next.isSuccess) {
            this.formInfo.formSubmitedStatus = FormSubmitedStatusEnum.Success;
            this.translate.get('MESSAGE.registration_completed_successfully').subscribe((str: string) => { this.formInfo.formAlert = str; });
            this.cmsToastrService.typeSuccessAdd();
          } else {
            this.formInfo.formSubmitedStatus = FormSubmitedStatusEnum.Error;
            this.cmsToastrService.typeErrorAdd(next.errorMessage);
          }
          this.loading.Stop(pName);
          this.cdr.markForCheck();


        },
        (error) => {
          this.loading.Stop(pName);

          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorAdd(error);
          this.cdr.markForCheck();
        }
      );
  }

  onActionSelectorSelect(model: TicketingTemplateModel | null): void {
    if (!model || model.id <= 0) {
      const message = this.translate.instant('MESSAGE.Information_template_is_not_clear');
      this.cmsToastrService.typeWarningSelected(message);
      return;
    }
    this.dataModel.htmlBody = model.htmlBody;
  }

  onActionBackToParent(): void {
    this.router.navigate(['/application/app/']);
  }


  onActionSelectSource(model: ApplicationSourceModel | null): void {
    if (!model || model.id <= 0) {
      this.cmsToastrService.typeErrorMessage(
        this.translate.instant('MESSAGE.Specify_the_source'),
        this.translate.instant('MESSAGE.The_source_of_the_information_application_is_not_known')
      );
      return;
    }
    this.dataModel.linkTicketingDepartemenId = model.id;
  }

  onCaptchaOrder(): void {
    if (this.onCaptchaOrderInProcess) {
      return;
    }
    this.dataModel.captchaText = '';
    this.coreAuthService.ServiceCaptcha().subscribe(
      (next) => {
        if (next.isSuccess) {
          this.captchaModel = next.item;
          this.expireDate = next.item.expire;//.split('+')[1];
          const startDate = new Date();
          const endDate = new Date(next.item.expire);
          const seconds = (endDate.getTime() - startDate.getTime());
          if (this.aoutoCaptchaOrder < 10) {
            this.aoutoCaptchaOrder = this.aoutoCaptchaOrder + 1;
            setTimeout(() => { this.onCaptchaOrder(); }, seconds);
          }
        } else {
          this.cmsToastrService.typeErrorGetCpatcha(next.errorMessage);
        }
        this.onCaptchaOrderInProcess = false;
      }
      , (error) => {
        this.onCaptchaOrderInProcess = false;
      }
    );
  }

}
