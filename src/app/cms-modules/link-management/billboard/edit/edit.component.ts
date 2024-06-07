
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Map as leafletMap } from 'leaflet';
import {
  AccessModel, ClauseTypeEnum,
  ErrorExceptionResult, ErrorExceptionResultBase, FilterDataModel, FilterModel, FormInfoModel, InfoEnumModel, LinkManagementBillboardCategoryModel, LinkManagementBillboardCategoryService, LinkManagementBillboardModel, LinkManagementBillboardPatternModel, LinkManagementBillboardService, LinkManagementMemberModel, ManageUserAccessDataTypesEnum
} from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';


import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { EditBaseComponent } from 'src/app/core/cmsComponent/editBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { PoinModel } from 'src/app/core/models/pointModel';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';

@Component({
  selector: 'app-linkmanagement-Billboard-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'
  ]
})
export class LinkManagementBillboardEditComponent extends EditBaseComponent<LinkManagementBillboardService, LinkManagementBillboardModel, number>
  implements OnInit, AfterViewInit {
  requestId = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    private contentCategoryService: LinkManagementBillboardCategoryService,
    private linkManagementBillboardService: LinkManagementBillboardService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(linkManagementBillboardService, new LinkManagementBillboardModel(), publicHelper);

    this.loading.cdr = this.cdr; this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    this.loadingOption.cdr = this.cdr;

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.optionActionTitle = this.translate.instant('ACTION.Add_To_List');
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  dataModel = new LinkManagementBillboardModel();
  dataAccessModel: AccessModel;

  dataModelResult: ErrorExceptionResultBase = new ErrorExceptionResultBase();

  dataModelEnumManagementContentSettingTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  dataModelEnumSharingPriceTypeResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  optionActionTitle = '';
  optionActionButtomEnable = true;
  optionTabledisplayedColumns = ['Id', 'Option', 'OptionAnswer', 'IsCorrectAnswer', 'NumberOfVotes', 'ScoreOfVotes', 'Action'];
  dataContentCategoryModel: number[] = [];



  loadingOption = new ProgressSpinnerModel();
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  selectFileTypePodcast = ['mp3'];
  selectFileTypeMovie = ['mp4', 'webm'];
  formInfo: FormInfoModel = new FormInfoModel();
  fileManagerOpenForm = false;
  fileManagerOpenFormPodcast = false;
  fileManagerOpenFormMovie = false;
  fileManagerTree: TreeModel;
  tagIdsData: number[];


  appLanguage = 'fa';

  viewMap = false;
  mapMarker: any;
  private mapModel: leafletMap;
  private mapMarkerPoints: Array<PoinModel> = [];
  mapOptonCenter = new PoinModel();


  ngOnInit(): void {
    this.requestId = + Number(this.activatedRoute.snapshot.paramMap.get('Id'));
    if (this.requestId === 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }
    this.DataGetOne();
    this.DataCategoryGetAll();

  }

  ngAfterViewInit(): void {

  }
  onActionFileSelectedLinkMainImageId(model: NodeInterface): void {
    this.dataModel.linkMainImageId = model.id;
    this.dataModel.linkMainImageIdSrc = model.downloadLinksrc;
  }





  onFormSubmit(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }


    this.DataEditContent();
  }

  DataGetOne(): void {
    this.formInfo.formSubmitAllow = false;
    this.formInfo.formAlert = this.translate.instant('MESSAGE.get_information_from_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    /*َAccess Field*/
    this.linkManagementBillboardService.setAccessLoad();
    this.linkManagementBillboardService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
    this.linkManagementBillboardService
      .ServiceGetOneById(this.requestId)
      .subscribe({
        next: (ret) => {

          /*َAccess Field*/
          this.dataAccessModel = ret.access;
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
          this.dataModelResult = ret;
          this.formInfo.formSubmitAllow = true;

          if (ret.isSuccess) {
            this.dataModel = ret.item;
          } else {
            this.cmsToastrService.typeErrorGetOne(ret.errorMessage);
          }
          this.loading.Stop(pName);

        },
        error: (er) => {
          this.loading.Stop(pName);
          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorGetOne(er);
        }
      }
      );
  }

  DataEditContent(): void {
    //! for convert color to hex
    this.dataModel.bgColor = this.dataModel.bgColor?.toString();
    this.formInfo.formSubmitAllow = false;
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName, this.translate.instant('MESSAGE.sending_information_to_the_server'));


    this.linkManagementBillboardService
      .ServiceEdit(this.dataModel)
      .subscribe({
        next: (ret) => {
          this.loading.Stop(pName);

          this.formInfo.formSubmitAllow = true;
          this.dataModelResult = ret;
          if (ret.isSuccess) {

            this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
            this.cmsToastrService.typeSuccessEdit();

            //setTimeout(() => this.router.navigate(['/linkmanagement/billboard']), 1000);
          } else {
            this.cmsToastrService.typeErrorEdit(ret.errorMessage);
          }
          this.loading.Stop(pName);

        },
        error: (er) => {
          this.loading.Stop(pName);
          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeError(er);;
        }
      }
      );
  }

  onActionSelectorSelectLinkManagementMemberId(model: LinkManagementMemberModel | null): void {
    if (!model || model.id <= 0) {
      const message = this.translate.instant('MESSAGE.Type_of_User_account_is_not_known');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkBillboardPatternId = model.id;
  }
  onActionSelectorSelectLinkBillboardPatternId(model: LinkManagementBillboardPatternModel | null): void {
    if (!model || model.id <= 0) {
      const message = this.translate.instant('MESSAGE.Category_of_billboard_information_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkBillboardPatternId = model.id;
  }
  DataCategoryGetAll(): void {
    this.formInfo.formSubmitAllow = false;
    this.formInfo.formAlert = this.translate.instant('MESSAGE.get_category_information_from_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    const filterModel = new FilterModel();
    const filter = new FilterDataModel();
    filter.propertyName = 'LinkManagementBillboardId';
    filter.value = this.requestId;
    filter.clauseType = ClauseTypeEnum.And;
    filterModel.filters.push(filter);


    this.tagIdsData = [];
    this.contentCategoryService
      .ServiceGetAll(filterModel)
      .subscribe({
        next: (ret) => {

          const itemList = [];
          ret.listItems.forEach(element => {
            itemList.push(element.linkCategoryId);
          });
          this.dataContentCategoryModel = itemList;
          this.formInfo.formSubmitAllow = true;
          this.loading.Stop(pName);
        },
        error: (er) => {
          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(er);
          this.loading.Stop(pName);
        }
      }
      );
  }
  onActionCategorySelectChecked(model: number): void {

    if (!model || model <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const entity = new LinkManagementBillboardCategoryModel();
    entity.linkCategoryId = model;
    entity.linkManagementBillboardId = this.dataModel.id;
    this.contentCategoryService.ServiceAdd(entity).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_in_this_group_was_successful');
          this.cmsToastrService.typeSuccessEdit();
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
      }
    }
    );


  }
  onActionCategorySelectDisChecked(model: number): void {

    if (!model || model <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_information_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const entity = new LinkManagementBillboardCategoryModel();
    entity.linkCategoryId = model;
    entity.linkManagementBillboardId = this.dataModel.id;
    this.contentCategoryService.ServiceDeleteEntity(entity).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_in_this_group_was_successful');
          this.cmsToastrService.typeSuccessEdit();
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
      }
    }
    );
  }
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      if (!this.formGroup.valid) {
        this.cmsToastrService.typeErrorFormInvalid();
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
    }
  }
  onActionBackToParent(): void {
    this.router.navigate(['/linkmanagement/billboard/']);
  }

}
