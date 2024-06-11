
import {
  ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ContactCategoryModel, ContactContentModel, ContactContentService, CoreEnumService, DataFieldInfoModel, ErrorExceptionResult,
  FormInfoModel
} from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { AddBaseComponent } from 'src/app/core/cmsComponent/addBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-contact-content-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class ContactContentAddComponent extends AddBaseComponent<ContactContentService, ContactContentModel, string> implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ContactContentAddComponent>,
    public coreEnumService: CoreEnumService,
    public ContactContentService: ContactContentService,
    private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    super(ContactContentService, new ContactContentModel(), publicHelper);
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });

    if (data && data.linkCategoryId && data.linkCategoryId.length > 0)
      this.dataModel.linkCategoryId = data.linkCategoryId;
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  dataModelResult: ErrorExceptionResult<ContactContentModel> = new ErrorExceptionResult<ContactContentModel>();
  dataModel: ContactContentModel = new ContactContentModel();


  formInfo: FormInfoModel = new FormInfoModel();


  fileManagerOpenForm = false;


  onActionFileSelected(model: NodeInterface): void {

  }

  ngOnInit(): void {
    this.formInfo.formTitle = this.translate.instant('TITLE.Register_New_Categories');

    this.DataGetAccess();
  }



  DataAddContent(): void {
    this.formInfo.formAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.formError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    this.ContactContentService.ServiceAdd(this.dataModel).subscribe({
      next: (ret) => {
        this.formInfo.formSubmitAllow = true;
        this.dataModelResult = ret;
        if (ret.isSuccess) {
          this.formInfo.formAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessAdd();
          this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.formAlert = this.translate.instant('ERRORMESSAGE.MESSAGE.typeError');
          this.formInfo.formError = ret.errorMessage;
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);

      },
      error: (er) => {
        this.formInfo.formSubmitAllow = true;
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );
  }
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    if (!this.dataModel.linkCategoryId || this.dataModel.linkCategoryId.length == 0) {
      const message = 'دست بندی   مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.formInfo.formSubmitAllow = false;

    this.DataAddContent();

  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }

  onActionSelectCategory(model: ContactCategoryModel | null): void {
    if (!model || model.id?.length == 0) {
      const message = this.translate.instant('MESSAGE.Category_is_not_clear');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.linkCategoryId = model.id;
  }
}
