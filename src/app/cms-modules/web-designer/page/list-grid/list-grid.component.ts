
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreSiteCategoryModel,
  CoreSiteCategoryService,
  ErrorExceptionResult, FilterDataModel, FilterModel, RecordStatusEnum, SortTypeEnum,
  WebDesignerMainPageModel,
  WebDesignerMainPageService, WebDesignerMainPageTemplateModel,
  WebDesignerMainPageTemplateService
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ListBaseComponent } from 'src/app/core/cmsComponent/listBaseComponent';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { PageInfoService } from 'src/app/core/services/page-info.service';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { environment } from 'src/environments/environment';
import { WebDesignerMainPageAddComponent } from '../add/add.component';
import { WebDesignerMainPageEditComponent } from '../edit/edit.component';
@Component({
  selector: 'app-webdesigner-page-list-grid',
  templateUrl: './list-grid.component.html',
})
export class WebDesignerMainPageListGridComponent extends ListBaseComponent<WebDesignerMainPageService, WebDesignerMainPageModel, string> implements OnInit, OnDestroy {
  requestLinkPageParentGuId = '';
  requestLinkPageTemplateGuId = '';
  requestLinkPageDependencyGuId = '';
  constructor(
    public contentService: WebDesignerMainPageService,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private webDesignerMainPageTemplateService: WebDesignerMainPageTemplateService,
    private coreSiteCategoryService: CoreSiteCategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public tokenHelper: TokenHelper,
    public pageInfo: PageInfoService,
    public publicHelper: PublicHelper,
    public dialog: MatDialog) {
    super(contentService, new WebDesignerMainPageModel(), publicHelper, tokenHelper);
    this.loading.cdr = this.cdr; this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageTemplateGuId')) {
      this.requestLinkPageTemplateGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageTemplateGuId');
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageDependencyGuId')) {
      this.requestLinkPageDependencyGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageDependencyGuId');
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageParentGuId')) {
      this.requestLinkPageParentGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageParentGuId');
    }
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };

    /*filter Sort*/
    this.filteModelContent.sortColumn = 'CreatedDate';
    this.filteModelContent.sortType = SortTypeEnum.Descending;
    if (this.requestLinkPageTemplateGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkPageTemplateGuId';
      filter.value = this.requestLinkPageTemplateGuId;
      this.filteModelContent.filters.push(filter);
    }
    if (this.requestLinkPageDependencyGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkPageDependencyGuId';
      filter.value = this.requestLinkPageDependencyGuId;
      this.filteModelContent.filters.push(filter);
    }
    if (this.requestLinkPageParentGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkPageParentGuId';
      filter.value = this.requestLinkPageParentGuId;
      this.filteModelContent.filters.push(filter);
    }
  }

  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  filteModelContent = new FilterModel();
  dataModelWebDesignerMainPageTemplateResult: ErrorExceptionResult<WebDesignerMainPageTemplateModel> = new ErrorExceptionResult<WebDesignerMainPageTemplateModel>();
  dataModelCoreSiteCategoryResult: ErrorExceptionResult<CoreSiteCategoryModel> = new ErrorExceptionResult<CoreSiteCategoryModel>();
  tabledisplayedColumns: string[] = [
    'ThumbnailImageSrc',
    'Id',
    'RecordStatus',
    'Title',
    // 'LinkPageParentGuId',
    // 'LinkPageDependencyGuId',
    'LinkPageTemplateGuId',
    'PageDependencyIsDefaultPage',
    'PageDependencyIsDefaultPageLinkSiteCategoryId',
    'Action'
  ];
  expandedElement: WebDesignerMainPageModel | null;
  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.filteModelContent.sortColumn = 'Title';
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      this.DataGetAll();
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      this.DataGetAll();
    });
    this.getModuleList();
    this.getSiteCategory();
  }
  getModuleList(): void {
    const filter = new FilterModel();
    filter.rowPerPage = 100;
    this.webDesignerMainPageTemplateService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelWebDesignerMainPageTemplateResult = next;
    });
  }
  getSiteCategory(): void {
    const filter = new FilterModel();
    filter.rowPerPage = 100;
    this.coreSiteCategoryService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelCoreSiteCategoryResult = next;
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.onActionTableRowSelect(new WebDesignerMainPageModel());
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.filteModelContent.accessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    this.contentService.ServiceGetAllEditor(filterModel).subscribe(
      (next) => {
        if (next.isSuccess) {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.access);
          this.dataModelResult = next;
          this.tableSource.data = next.listItems;
          if (this.optionsStatist?.data?.show)
            this.onActionButtonStatist(true);
          if (this.optionsSearch.childMethods) {
            this.optionsSearch.childMethods.setAccess(next.access);
          }
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
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
        SortTypeEnum
        sort.start = 'desc';
      }
    } else {
      this.filteModelContent.sortColumn = sort.active;
      this.filteModelContent.sortType = SortTypeEnum.Descending;
    } SortTypeEnum
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
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessAddRow
    ) {
      this.cmsToastrService.typeErrorAccessAdd();
      return;
    }
    var panelClass = '';
    if (this.tokenHelper.isMobile)
      panelClass = 'dialog-fullscreen';
    else
      panelClass = 'dialog-min';
    const dialogRef = this.dialog.open(WebDesignerMainPageAddComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: { linkPageDependencyGuId: this.requestLinkPageDependencyGuId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionButtonEditRow(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
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
    const dialogRef = this.dialog.open(WebDesignerMainPageEditComponent, {
      height: '90%',
      panelClass: panelClass,
      enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
      exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
      data: { id: this.tableRowSelected.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionButtonDeleteRow(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const emessage = this.translate.instant('MESSAGE.no_row_selected_to_delete');
      this.cmsToastrService.typeErrorSelected(emessage);
      return;
    }
    this.onActionTableRowSelect(model);

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
          const pName = this.constructor.name + 'main';
          this.loading.Start(pName);
          this.contentService.ServiceDelete(this.tableRowSelected.id).subscribe(
            (next) => {
              if (next.isSuccess) {
                this.cmsToastrService.typeSuccessRemove();
                this.DataGetAll();
              } else {
                this.cmsToastrService.typeErrorRemove();
              }
              this.loading.Stop(pName);
            },
            (error) => {
              this.cmsToastrService.typeError(error);
              this.loading.Stop(pName);
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
  onActionButtonGoToSiteCategoryList(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const message = this.translate.instant('MESSAGE.no_row_selected_to_display');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(model);
    this.router.navigate(['/core/siteSiteCategory/', this.tableRowSelected.id]);
  }
  onActionButtonStatist(view = !this.optionsStatist.data.show): void {
    this.optionsStatist.data.show = view;
    if (!this.optionsStatist.data.show) {
      return;
    }
    const statist = new Map<string, number>();
    statist.set(this.translate.instant('MESSAGE.Active'), 0);
    statist.set(this.translate.instant('MESSAGE.All'), 0);
    const pName = this.constructor.name + '.ServiceStatist';
    this.loading.Start(pName, this.translate.instant('MESSAGE.Get_the_statist'));
    this.contentService.ServiceGetCount(this.filteModelContent).subscribe(
      (next) => {
        if (next.isSuccess) {
          statist.set('All', next.totalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.propertyName = 'RecordStatus';
    fastfilter.value = RecordStatusEnum.Available;
    filterStatist1.filters.push(fastfilter);
    this.contentService.ServiceGetCount(filterStatist1).subscribe(
      (next) => {
        if (next.isSuccess) {
          statist.set('Active', next.totalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
        this.loading.Stop(pName);
      }
      ,
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );

  }
  onActionButtonHtmlEditor(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(model);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    // const urlTemplate = environment.cmsServerConfig.configHtmlBuilderServerPath + 'htmlbuilder/?id=' + model.id + '&token=' + encodeURIComponent(this.tokenInfo.token);
    window.open(model.htmlBuilderUrl, '_blank');
  }
  onActionButtonHtmlView(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(model);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    window.open(this.dataModelResult.item.htmlPreviewByMasterUrl, '_blank');
  }
  onActionButtonSiteRouteView(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(model);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.contentService.ServiceWebRoute(model.id).subscribe(
      (next) => {
        if (next.isSuccess) {
          window.open(next.item, '_blank');
        }
        else {
          this.cmsToastrService.typeError(next.errorMessage);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );

  }
  onActionButtonHtmlViewWithOutParent(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.onActionTableRowSelect(model);
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    window.open(this.dataModelResult.item.htmlPreviewUrl, '_blank');
  }



  onActionButtonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.filters = model;
    this.DataGetAll();
  }

  onActionBackToParentTemplate(): void {
    this.router.navigate(['/webdesigner/pagetemplate']);
  }
  onActionBackToParentDependency(): void {
    this.router.navigate(['/webdesigner/pagedependency']);
  }
}
