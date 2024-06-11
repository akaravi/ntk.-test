
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  ApplicationAppModel,
  ApplicationAppService,
  ApplicationSourceModel,
  FilterDataModel,
  FilterModel,
  RecordStatusEnum,
  SortTypeEnum
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ListBaseComponent } from 'src/app/core/cmsComponent/listBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { PageInfoService } from 'src/app/core/services/page-info.service';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { environment } from 'src/environments/environment';
import { ApplicationLogNotificationActionSendComponent } from '../../notification/action-send/action-send.component';
import { ApplicationAppDownloadComponent } from '../download/download.component';
import { ApplicationAppUploadAppComponent } from '../uploadApp/uploadApp.component';
import { ApplicationAppUploadUpdateComponent } from '../uploadUpdate/uploadUpdate.component';

@Component({
  selector: 'app-application-app-list',
  templateUrl: './list.component.html',
})
export class ApplicationAppListComponent extends ListBaseComponent<ApplicationAppService, ApplicationAppModel, number> implements OnInit, OnDestroy {
  requestLinkSourceId = 0;
  requestLinkThemeConfigId = 0;
  constructor(
    public contentService: ApplicationAppService,
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    public translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    public pageInfo: PageInfoService,
    public tokenHelper: TokenHelper,
    public dialog: MatDialog,
  ) {
    super(contentService, new ApplicationAppModel(), publicHelper, tokenHelper);
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };

    /*filter Sort*/
    this.filteModelContent.sortColumn = 'Id';
    this.filteModelContent.sortType = SortTypeEnum.Descending;
  }
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  filteModelContent = new FilterModel();

  categoryModelSelected: ApplicationSourceModel;

  tabledisplayedColumns: string[] = [];
  tabledisplayedColumnsSource: string[] = [
    'Id',
    'RecordStatus',
    'Title',
    'AppVersion',
    'LinkSourceId',
    'CreatedDate',
    'UpdatedDate',
    'LastSuccessfullyBuildDate',
    // 'Action'
  ];
  tabledisplayedColumnsMobileSource: string[] = [
    'Title',
    'AppVersion',
    // 'Action'
  ];
  expandedElement: ApplicationAppModel | null;
  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.requestLinkSourceId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkSourceId'));
    this.requestLinkThemeConfigId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkThemeConfigId'));
    const filter = new FilterDataModel();
    if (this.requestLinkSourceId > 0) {
      filter.propertyName = 'LinkSourceId';
      filter.value = this.requestLinkSourceId;
      this.filteModelContent.filters.push(filter);
    }
    if (this.requestLinkThemeConfigId > 0) {
      filter.propertyName = 'LinkThemeConfigId';
      filter.value = this.requestLinkThemeConfigId;
      this.filteModelContent.filters.push(filter);
    }
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      this.DataGetAll();
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      this.DataGetAll();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tabledisplayedColumns = this.publicHelper.TableDisplayedColumns(this.tabledisplayedColumnsSource, this.tabledisplayedColumnsMobileSource, [], this.tokenInfo);

    if (this.requestLinkSourceId === 0) {
      this.tabledisplayedColumns = this.publicHelper.listRemoveIfExist(
        this.tabledisplayedColumns,
        'LinkSourceId'
      );
    }
    this.tableRowsSelected = [];
    this.onActionTableRowSelect(new ApplicationAppModel());
    const pName = this.constructor.name + 'contentService.ServiceGetAll';
    this.translate.get('MESSAGE.get_information_list').subscribe((str: string) => { this.loading.Start(pName, str); });
    this.filteModelContent.accessLoad = true;
    const filter = new FilterDataModel();
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    if (this.categoryModelSelected && this.categoryModelSelected.id > 0) {
      filter.propertyName = 'LinkSourceId';
      filter.value = this.categoryModelSelected.id;
      filterModel.filters.push(filter);
    }
    this.contentService.ServiceGetAllEditor(filterModel).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
          this.dataModelResult = ret;
          this.tableSource.data = ret.listItems;

          if (this.optionsStatist?.data?.show)
            this.onActionButtonStatist(true);
          if (this.optionsSearch.childMethods) {
            this.optionsSearch.childMethods.setAccess(ret.access);
          }
        }
        else {
          this.cmsToastrService.typeErrorGetAll(ret.errorMessage);
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
  onTableSortData(sort: MatSort): void {
    if (this.tableSource && this.tableSource.sort && this.tableSource.sort.active === sort.active) {
      if (this.tableSource.sort.start === 'asc') {
        sort.start = 'desc';
        this.filteModelContent.sortColumn = sort.active;
        this.filteModelContent.sortType = SortTypeEnum.Descending;
      } else if (this.tableSource.sort.start === 'desc') {
        sort.start = 'asc';
        this.filteModelContent.sortColumn = '';
        this.filteModelContent.sortType = SortTypeEnum.Ascending;
      } else {
        sort.start = 'desc';
      }
    } else {
      this.filteModelContent.sortColumn = sort.active;
      this.filteModelContent.sortType = SortTypeEnum.Descending;
    }
    this.tableSource.sort = sort;
    this.filteModelContent.currentPageNumber = 0;
    this.DataGetAll();
  }
  onTablePageingData(event?: PageEvent): void {
    this.filteModelContent.currentPageNumber = event.pageIndex + 1;
    this.filteModelContent.rowPerPage = event.pageSize;
    this.DataGetAll();
  }
  onActionButtonNewRow(): void {
    let sourceId = 0;
    if (
      this.requestLinkSourceId &&
      this.requestLinkSourceId > 0
    ) {
      sourceId = this.requestLinkSourceId;
    }
    if (
      this.categoryModelSelected &&
      this.categoryModelSelected.id > 0
    ) {
      sourceId = this.categoryModelSelected.id;
    }
    if (sourceId === 0) {
      const message = this.translate.instant('MESSAGE.Application_source_type_is_not_selected');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessAddRow
    ) {
      this.cmsToastrService.typeErrorAccessAdd();
      return;
    }
    setTimeout(() => this.router.navigate(['/application/app/add/', sourceId]), 1000);
  }
  onActionSelectorSelect(model: ApplicationSourceModel | null): void {
    /*filter */
    var sortColumn = this.filteModelContent.sortColumn;
    var sortType = this.filteModelContent.sortType;
    this.filteModelContent = new FilterModel();
    this.filteModelContent.sortColumn = sortColumn;
    this.filteModelContent.sortType = sortType;
    /*filter */
    this.categoryModelSelected = model;
    this.DataGetAll();
  }
  onActionButtonEditRow(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (!mode || !mode.id || mode.id === 0) {
      this.cmsToastrService.typeErrorSelected(this.translate.instant('MESSAGE.No_row_selected_for_editing'));
      return;
    }
    this.onActionTableRowSelect(mode);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    setTimeout(() => this.router.navigate(['/application/app/edit/', this.tableRowSelected.id]), 1000);
  }
  onActionButtonDeleteRow(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const emessage = this.translate.instant('MESSAGE.No_row_selected_for_editing');
      this.cmsToastrService.typeErrorSelected(emessage);
      return;
    }
    this.onActionTableRowSelect(mode);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessDeleteRow
    ) {
      this.cmsToastrService.typeErrorAccessDelete();
      return;
    }
    const title = this.translate.instant('MESSAGE.Please_Confirm');
    const message = this.translate.instant('MESSAGE.Do_you_want_to_delete_this_content') + '?' + '<br> ( ' + this.tableRowSelected.title + ' ) ';
    this.cmsConfirmationDialogService.confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + 'contentService.ServiceDelete';
          this.loading.Start(pName);

          this.contentService.ServiceDelete(this.tableRowSelected.id).subscribe({
            next: (ret) => {
              if (ret.isSuccess) {
                this.cmsToastrService.typeSuccessRemove();
                this.DataGetAll();
              } else {
                this.cmsToastrService.typeErrorRemove();
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
      }
      )
      .catch(() => {
        // console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
      }
      );

  }
  onActionButtonStatist(view = !this.optionsStatist.data.show): void {
    this.optionsStatist.data.show = view;
    if (!this.optionsStatist.data.show) {
      return;
    }
    const statist = new Map<string, number>();
    statist.set('Active', 0);
    statist.set(this.translate.instant('MESSAGE.All'), 0);
    const pName = this.constructor.name + '.ServiceStatist';
    this.translate.get('MESSAGE.Get_the_statist').subscribe((str: string) => { this.loading.Start(pName, str); });
    this.contentService.ServiceGetCount(this.filteModelContent).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.translate.get('MESSAGE.All').subscribe((str: string) => { statist.set(str, ret.totalRowCount) });
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
        else {
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
    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.propertyName = 'RecordStatus';
    fastfilter.value = RecordStatusEnum.Available;
    filterStatist1.filters.push(fastfilter);
    this.contentService.ServiceGetCount(filterStatist1).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.translate.get('MESSAGE.Active').subscribe((str: string) => { statist.set(str, ret.totalRowCount) });
          this.optionsStatist.childMethods.setStatistValue(statist);
        } else {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);
      }
      ,
      error: (er) => {
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );

  }



  onActionButtonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.filters = model;
    this.DataGetAll();
  }

  onActionBackToParent(): void {
    this.router.navigate(['/application/source/']);
  }
  onActionBackToParentTheme(): void {
    this.router.navigate(['/application/themeconfig/']);
  }
  onActionButtonUploadApp(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    this.onActionTableRowSelect(mode);
    const dialogRef = this.dialog.open(ApplicationAppUploadAppComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: this.tableRowSelected,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionButtonUploadUpdate(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    this.onActionTableRowSelect(mode);
    const dialogRef = this.dialog.open(ApplicationAppUploadUpdateComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: this.tableRowSelected,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionButtonBuildApp(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(mode);
    const pName = this.constructor.name + 'contentService.ServiceBuild';
    this.loading.Start(pName);
    this.contentService.ServiceBuild(this.tableRowSelected.id).subscribe({
      next: (ret) => {
        this.loading.Stop(pName);
        if (ret.isSuccess) {
          this.cmsToastrService.typeSuccessAppBuild(ret.errorMessage);
        }
        else {
          this.cmsToastrService.typeErrorGetAll(ret.errorMessage);
        }
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
        this.loading.Stop(pName);
      }
    }
    );
  }
  onActionButtonDownloadApp(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    this.onActionTableRowSelect(mode);
    const dialogRef = this.dialog.open(ApplicationAppDownloadComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: this.tableRowSelected,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionButtonNotifictionActionSend(model: ApplicationAppModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id === 0) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.onActionTableRowSelect(model);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    const dialogRef = this.dialog.open(ApplicationLogNotificationActionSendComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: { linkApplicationId: this.tableRowSelected.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {

      }
    });
  }
  onActionButtonMemberList(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(mode);
    this.router.navigate(['/application/memberinfo/LinkApplicationId/', this.tableRowSelected.id]);
  }
  onActionButtonIntroList(mode: ApplicationAppModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(mode);
    this.router.navigate(['/application/intro/LinkApplicationId/', this.tableRowSelected.id]);
  }
}
