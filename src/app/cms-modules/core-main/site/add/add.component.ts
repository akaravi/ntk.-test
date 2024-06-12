
import { ENTER } from '@angular/cdk/keycodes';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Leaflet from 'leaflet';
import { Map as leafletMap } from 'leaflet';
import {
  AccessModel, CoreEnumService, CoreSiteCategoryModel, CoreSiteModel,
  CoreSiteService, DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel, InfoEnumModel, LanguageEnum, SiteStatusEnum
} from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { PoinModel } from 'src/app/core/models/pointModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
@Component({
  selector: 'app-core-site-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class CoreSiteAddComponent extends AddBaseComponent<CoreSiteService, CoreSiteModel, number> implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    public coreEnumService: CoreEnumService,
    private coreSiteService: CoreSiteService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(coreSiteService, new CoreSiteModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.dataModel.ownerSiteSetStatus = SiteStatusEnum.Active;
    this.dataModel.userLanguage = LanguageEnum.fa;
  }
  requestId = 0;

  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  formInfo: FormInfoModel = new FormInfoModel();
  dataAccessModel: AccessModel;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  dataModel = new CoreSiteModel();
  dataModelResult: ErrorExceptionResult<CoreSiteModel> = new ErrorExceptionResult<CoreSiteModel>();

  dataModelEnumSiteStatusResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  dataModelEnumLanguageResult: ErrorExceptionResult<InfoEnumModel> = new ErrorExceptionResult<InfoEnumModel>();
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerOpenFormAboutUsLinkImageId = false;
  fileManagerOpenFormLinkFavIconId = false;
  fileManagerOpenFormPwaIconSize512x512Id = false;
  fileManagerOpenFormPwaIconSize72x72Id = false;
  fileManagerOpenFormPwaIconSize192x192Id = false;
  fileManagerOpenFormPwaIconSize384x384Id = false;
  fileManagerOpenFormLinkFileIdLogo = false;
  fileManagerOpenFormLinkImageLogoId = false;
  appLanguage = 'fa';
  fileManagerTree: TreeModel;
  mapMarker: any;
  private mapModel: leafletMap;
  private mapMarkerPoints: Array<PoinModel> = [];
  mapOptonCenter = new PoinModel();
  keywordDataModel = [];
  ngOnInit(): void {
    this.requestId = + Number(this.activatedRoute.snapshot.paramMap.get('Id'));
    if (this.requestId > 0) {
      this.dataModel.linkCreatedBySiteId = this.requestId;
    }
    this.DataGetAccess();

    this.getEnumSiteStatus();
    this.getEnumLanguage();
  }
  getEnumSiteStatus(): void {
    this.coreEnumService.ServiceSiteStatusEnum().subscribe((next) => {
      this.dataModelEnumSiteStatusResult = next;
    });
  }
  getEnumLanguage(): void {
    this.coreEnumService.ServiceLanguageEnum().subscribe((next) => {
      this.dataModelEnumLanguageResult = next;
    });
  }

  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }
    if (this.dataModel.linkCreatedBySiteId <= 0) {
      this.cmsToastrService.typeErrorAdd(this.translate.instant('MESSAGE.Specify_the_source_code_of_the_program'));
      return;
    }
    this.dataModel.seoKeyword = '';
    if (this.keywordDataModel && this.keywordDataModel.length > 0) {
      const listKeyword = [];
      this.keywordDataModel.forEach(element => {
        if (element.display) {
          listKeyword.push(element.display);
        } else {
          listKeyword.push(element);
        }
      });
      if (listKeyword && listKeyword.length > 0) {
        this.dataModel.seoKeyword = listKeyword.join(',');
      }
    }
    this.DataAddContent();
  }

  DataAddContent(): void {
    this.formInfo.formSubmitAllow = false;
    this.translate.get('MESSAGE.sending_information_to_the_server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    //! for convert color to hex
    this.dataModel.pwaThemeColor = this.dataModel.pwaThemeColor?.toString();
    //! for convert color to hex
    this.dataModel.pwaThemeBackgroundColor = this.dataModel.pwaThemeBackgroundColor?.toString();
    this.coreSiteService
      .ServiceAdd(this.dataModel)
      .subscribe({
        next: (ret) => {
          this.formInfo.formSubmitAllow = !ret.isSuccess;
          this.dataModelResult = ret;
          if (ret.isSuccess) {
            this.translate.get('MESSAGE.registration_completed_successfully').subscribe((str: string) => { this.formInfo.formAlert = str; });
            this.cmsToastrService.typeSuccessAdd();
            setTimeout(() => this.router.navigate(['/core/site/']), 1000);
          } else {
            this.cmsToastrService.typeErrorAdd(ret.errorMessage);
          }
          this.loading.Stop(pName);
        },
        error: (er) => {
          this.loading.Stop(pName);
          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorAdd(er);
        }
      }
      );
  }
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
    }
  }
  receiveMap(model: leafletMap = this.mapModel): void {
    if (!model) {
      return;
    }
    this.mapModel = model;
    if (this.mapMarkerPoints && this.mapMarkerPoints.length > 0) {
      this.mapMarkerPoints.forEach(item => {
        this.mapMarker = Leaflet.marker([item.lat, item.lon]).addTo(this.mapModel);
      });
      this.mapOptonCenter = this.mapMarkerPoints[0];
      this.mapMarkerPoints = [];
    }
    this.mapModel.on('click', (e) => {
      // @ts-ignore
      const lat = e.latlng.lat;
      // @ts-ignore
      const lon = e.latlng.lng;
      if (this.mapMarker !== undefined) {
        this.mapModel.removeLayer(this.mapMarker);
      }
      if (lat === this.dataModel.aboutUsGeolocationlatitude && lon === this.dataModel.aboutUsGeolocationlongitude) {
        this.dataModel.aboutUsGeolocationlatitude = null;
        this.dataModel.aboutUsGeolocationlongitude = null;
        return;
      }
      this.mapMarker = Leaflet.marker([lat, lon]).addTo(this.mapModel);
      this.dataModel.aboutUsGeolocationlatitude = lat;
      this.dataModel.aboutUsGeolocationlongitude = lon;
    });
  }
  onActionBackToParent(): void {
    this.router.navigate(['/core/site/']);
  }
  onActionFileSelectedAboutUsLinkImageId(model: NodeInterface): void {
    this.dataModel.aboutUsLinkImageId = model.id;
    this.dataModel.aboutUsLinkImageIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkFavIconId(model: NodeInterface): void {
    this.dataModel.linkFavIconId = model.id;
    this.dataModel.linkFavIconIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize72x72Id(model: NodeInterface): void {
    this.dataModel.pwaIconSize72x72Id = model.id;
    this.dataModel.pwaIconSize72x72IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize192x192Id(model: NodeInterface): void {
    this.dataModel.pwaIconSize192x192Id = model.id;
    this.dataModel.pwaIconSize192x192IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize384x384Id(model: NodeInterface): void {
    this.dataModel.pwaIconSize384x384Id = model.id;
    this.dataModel.pwaIconSize384x384IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize512x512Id(model: NodeInterface): void {
    this.dataModel.pwaIconSize512x512Id = model.id;
    this.dataModel.pwaIconSize512x512IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkImageLogoId(model: NodeInterface): void {
    this.dataModel.linkImageLogoId = model.id;
    this.dataModel.linkImageLogoIdSrc = model.downloadLinksrc;
  }
  onActionSelectCategory(model: CoreSiteCategoryModel | null): void {
    if (!model || model.id <= 0) {
      const message = this.translate.instant('MESSAGE.category_of_site_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkSiteCategoryId = model.id;
  }
  /**
  * tag
  */
  addOnBlurTag = true;
  readonly separatorKeysCodes = [ENTER] as const;
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our item
    if (value) {
      this.keywordDataModel.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeTag(item: string): void {
    const index = this.keywordDataModel.indexOf(item);

    if (index >= 0) {
      this.keywordDataModel.splice(index, 1);
    }
  }
  /**
   * tag
   */
}
