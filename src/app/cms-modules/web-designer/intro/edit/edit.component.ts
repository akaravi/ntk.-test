import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AccessModel, CoreEnumService,
  FormInfoModel,
  ManageUserAccessDataTypesEnum, WebDesignerMainIntroModel,
  WebDesignerMainIntroService
} from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { EditBaseComponent } from 'src/app/core/cmsComponent/editBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
@Component({
  selector: 'app-webdesigner-intro-edit',
  templateUrl: './edit.component.html',
})
export class WebDesignerMainIntroEditComponent extends EditBaseComponent<WebDesignerMainIntroService, WebDesignerMainIntroModel, string>
  implements OnInit {
  requestId = '';
  constructor(
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    public coreEnumService: CoreEnumService,
    private webDesignerMainIntroService: WebDesignerMainIntroService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(webDesignerMainIntroService, new WebDesignerMainIntroModel(), publicHelper);

    this.loading.cdr = this.cdr; this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    if (this.activatedRoute.snapshot.paramMap.get('Id')) {
      this.requestId = this.activatedRoute.snapshot.paramMap.get('Id');
    }
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;


  formInfo: FormInfoModel = new FormInfoModel();
  dataAccessModel: AccessModel;
  dataModel = new WebDesignerMainIntroModel();



  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  selectFileTypeMainVideo = ['mp4'];
  fileManagerOpenForm = false;
  fileManagerOpenFormVideo = false;
  appLanguage = 'fa';
  fileManagerTree: TreeModel;
  ngOnInit(): void {
    if (this.requestId.length === 0) {
      this.cmsToastrService.typeErrorAddRowParentIsNull();
      return;
    }
    this.DataGetOne(this.requestId);

  }

  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }
    this.DataEditContent();
  }
  DataGetOne(requestId: string): void {
    this.formInfo.formSubmitAllow = false;
    this.translate.get('MESSAGE.get_information_from_the_server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    /*َAccess Field*/
    this.webDesignerMainIntroService.setAccessLoad();
    this.webDesignerMainIntroService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
    this.webDesignerMainIntroService
      .ServiceGetOneById(requestId)
      .subscribe(
        async (next) => {
          /*َAccess Field*/
          this.dataAccessModel = next.access;
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.access);
          this.loading.Stop(pName);
          this.dataModelResult = next;
          this.formInfo.formSubmitAllow = true;
          if (next.isSuccess) {
            this.dataModel = next.item;
          } else {
            this.cmsToastrService.typeErrorGetOne(next.errorMessage);
          }
        },
        (error) => {
          this.loading.Stop(pName);

          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorGetOne(error);
        }
      );
  }
  DataEditContent(): void {
    this.formInfo.formSubmitAllow = false;
    this.translate.get('MESSAGE.sending_information_to_the_server').subscribe((str: string) => { this.formInfo.formAlert = str; });
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.translate.get('MESSAGE.sending_information_to_the_server').subscribe((str: string) => { this.loading.Start(pName, str); });
    this.webDesignerMainIntroService
      .ServiceEdit(this.dataModel)
      .subscribe(
        async (next) => {
          this.formInfo.formSubmitAllow = !next.isSuccess;
          this.dataModelResult = next;
          if (next.isSuccess) {
            this.translate.get('MESSAGE.registration_completed_successfully').subscribe((str: string) => { this.formInfo.formAlert = str; });
            this.cmsToastrService.typeSuccessEdit();
            setTimeout(() => this.router.navigate(['/webdesigner/intro/']), 1000);
          } else {
            this.cmsToastrService.typeErrorEdit(next.errorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.loading.Stop(pName);

          this.formInfo.formSubmitAllow = true;
          this.cmsToastrService.typeErrorEdit(error);
        }
      );
  }
  onStepClick(event: StepperSelectionEvent, stepper: any): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      // if (!this.formGroup.valid) {
      //   this.cmsToastrService.typeErrorFormInvalid();
      //   setTimeout(() => {
      //     stepper.selectedIndex = event.previouslySelectedIndex;
      //     // stepper.previous();
      //   }, 10);
      // }
    }
  }
  onActionBackToParent(): void {
    this.router.navigate(['/webdesigner/intro/']);
  }
  onActionFileSelectedLinkMainImageId(model: NodeInterface): void {
    this.dataModel.linkMainImageId = model.id;
    this.dataModel.linkMainImageIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkMainVideoId(model: NodeInterface): void {
    this.dataModel.linkMainVideoId = model.id;
    this.dataModel.linkMainVideoIdSrc = model.downloadLinksrc;
  }
}
