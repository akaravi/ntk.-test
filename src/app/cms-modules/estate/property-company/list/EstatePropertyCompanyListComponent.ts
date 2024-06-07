import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    DataFieldInfoModel,
    EstatePropertyCompanyModel,
    EstatePropertyCompanyService, FilterDataModel,
    FilterModel, ManageUserAccessDataTypesEnum, RecordStatusEnum, SortTypeEnum, TokenInfoModel
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponent/base/componentOptionSearchModel';
import { ComponentOptionStatistModel } from 'src/app/core/cmsComponent/base/componentOptionStatistModel';
import { ListBaseComponent } from 'src/app/core/cmsComponent/listBaseComponent';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { PageInfoService } from 'src/app/core/services/page-info.service';
import { CmsLinkToComponent } from 'src/app/shared/cms-link-to/cms-link-to.component';
import { environment } from 'src/environments/environment';
import { PublicHelper } from '../../../../core/helpers/publicHelper';
import { ProgressSpinnerModel } from '../../../../core/models/progressSpinnerModel';
import { CmsToastrService } from '../../../../core/services/cmsToastr.service';
import { EstatePropertyCompanyDeleteComponent } from '../delete/delete.component';

@Component({
    selector: 'app-estate-property-company-list',
    templateUrl: './list.component.html',
    styleUrls: ["./list.component.scss"],
})
export class EstatePropertyCompanyListComponent extends ListBaseComponent<EstatePropertyCompanyService, EstatePropertyCompanyModel, string> implements OnInit, OnDestroy {
    constructor(
        public contentService: EstatePropertyCompanyService,
        private cmsToastrService: CmsToastrService,
        private router: Router,
        public tokenHelper: TokenHelper,
        private cdr: ChangeDetectorRef,
        public translate: TranslateService,
        public pageInfo: PageInfoService,
        public publicHelper: PublicHelper,
        public dialog: MatDialog,
    ) {
        super(contentService, new EstatePropertyCompanyModel(), publicHelper, tokenHelper);
        this.loading.cdr = this.cdr;
        this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
        this.optionsSearch.parentMethods = {
            onSubmit: (model) => this.onSubmitOptionsSearch(model),
        };

        /*filter Sort*/
        this.filteModelContent.sortColumn = 'Id';
        this.filteModelContent.sortType = SortTypeEnum.Descending;
    }
    link: string;

    filteModelContent = new FilterModel();

    optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
    optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();

    tokenInfo = new TokenInfoModel();
    loading = new ProgressSpinnerModel();

    categoryModelSelected: EstatePropertyCompanyModel;
    tabledisplayedColumns: string[] = [];
    tabledisplayedColumnsSource: string[] = [
        'LinkMainImageIdSrc',
        'Id',
        'RecordStatus',
        'mainAdminRecordStatus',
        'Title',
        'CreatedDate',
        // 'Action',
        'LinkTo',
    ];
    fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
    cmsApiStoreSubscribe: Subscription;
    GetAllWithHierarchyCategoryId = false;
    ngOnInit(): void {
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
        this.tabledisplayedColumns = this.publicHelper.TabledisplayedColumnsCheckByAllDataAccess(this.tabledisplayedColumnsSource, [], this.tokenInfo);
        this.tableRowsSelected = [];
        this.onActionTableRowSelect(new EstatePropertyCompanyModel());
        const pName = this.constructor.name + 'main';
        this.loading.Start(pName, this.translate.instant('MESSAGE.get_information_list'));
        this.filteModelContent.accessLoad = true;
        /*filter CLone*/
        const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
        /*filter CLone*/
        /** filter Category */
        if (this.categoryModelSelected && this.categoryModelSelected.id.length > 0) {
            const filterChild = new FilterDataModel();
            filterChild.propertyName = 'linkEstateCompanyCategoryId';
            filterChild.value = this.categoryModelSelected.id;
            filterModel.filters.push(filterChild);
        }
        /** filter Category */
        this.contentService.ServiceGetAllEditor(filterModel).subscribe({
            next: (ret) => {
                this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);
                if (ret.isSuccess) {
                    this.dataModelResult = ret;
                    this.tableSource.data = ret.listItems;


                    if (this.optionsSearch.childMethods) {
                        this.optionsSearch.childMethods.setAccess(ret.access);
                    }
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
    onActionButtonNewRow(event?: MouseEvent): void {

        if (this.dataModelResult == null ||
            this.dataModelResult.access == null ||
            !this.dataModelResult.access.accessAddRow) {
            this.cmsToastrService.typeErrorAccessAdd();
            return;
        }

        if (event?.ctrlKey) {
            this.link = "/#/estate/property-company/add/";
            window.open(this.link, "_blank");
        } else {
            this.router.navigate(['/estate/property-company/add']);
        }
    }
    onActionButtonEditRow(model: EstatePropertyCompanyModel = this.tableRowSelected, event?: MouseEvent): void {
        if (!model || !model.id || model.id.length === 0) {
            this.cmsToastrService.typeErrorSelectedRow();
            return;
        }
        this.onActionTableRowSelect(model);
        if (this.dataModelResult == null ||
            this.dataModelResult.access == null ||
            !this.dataModelResult.access.accessEditRow) {
            this.cmsToastrService.typeErrorAccessEdit();
            return;
        }

        if (event?.ctrlKey) {
            this.link = "/#/estate/property-company/edit/" + this.tableRowSelected.id;
            window.open(this.link, "_blank");
        } else {
            this.router.navigate(['/estate/property-company/edit', this.tableRowSelected.id]);
        }
    }
    onActionButtonProperty(model: EstatePropertyCompanyModel = this.tableRowSelected, event?: MouseEvent): void {
        if (!model || !model.id || model.id.length === 0) {
            this.cmsToastrService.typeErrorSelectedRow();
            return;
        }
        this.onActionTableRowSelect(model);
        if (this.dataModelResult == null ||
            this.dataModelResult.access == null ||
            !this.dataModelResult.access.accessEditRow) {
            this.cmsToastrService.typeErrorAccessEdit();
            return;
        }

        if (event?.ctrlKey) {
            this.link = "/#/estate/property/LinkCompanyId/" + this.tableRowSelected.id;
            window.open(this.link, "_blank");
        } else {
            this.router.navigate(['/estate/property/LinkCompanyId', this.tableRowSelected.id]);
        }
    }
    onActionButtonDeleteRow(model: EstatePropertyCompanyModel = this.tableRowSelected): void {
        if (!model || !model.id || model.id.length === 0) {
            const emessage = this.translate.instant('MESSAGE.no_row_selected_to_delete');
            this.cmsToastrService.typeErrorSelected(emessage);
            return;
        }
        this.onActionTableRowSelect(model);

        if (this.dataModelResult == null ||
            this.dataModelResult.access == null ||
            !this.dataModelResult.access.accessDeleteRow) {
            this.cmsToastrService.typeErrorAccessDelete();
            return;
        }
        var panelClass = '';
        if (this.tokenHelper.isMobile)
            panelClass = 'dialog-fullscreen';

        else
            panelClass = 'dialog-min';
        const dialogRef = this.dialog.open(EstatePropertyCompanyDeleteComponent, {
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
    onActionButtonStatist(): void {
        this.optionsStatist.data.show = !this.optionsStatist.data.show;
        if (!this.optionsStatist.data.show) {
            return;
        }
        const statist = new Map<string, number>();
        statist.set(this.translate.instant('MESSAGE.Active'), 0);
        statist.set(this.translate.instant('MESSAGE.All'), 0);
        const pName = this.constructor.name + '.ServiceStatist';
        this.loading.Start(pName, this.translate.instant('MESSAGE.Get_the_statist'));
        this.contentService.ServiceGetCount(this.filteModelContent).subscribe({
            next: (ret) => {
                if (ret.isSuccess) {
                    statist.set(this.translate.instant('MESSAGE.All'), ret.totalRowCount);
                    this.optionsStatist.childMethods.setStatistValue(statist);
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
        const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
        const fastfilter = new FilterDataModel();
        fastfilter.propertyName = 'RecordStatus';
        fastfilter.value = RecordStatusEnum.Available;
        filterStatist1.filters.push(fastfilter);
        this.contentService.ServiceGetCount(filterStatist1).subscribe({
            next: (ret) => {
                if (ret.isSuccess) {
                    statist.set(this.translate.instant('MESSAGE.Active'), ret.totalRowCount);
                    this.optionsStatist.childMethods.setStatistValue(statist);
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


    onActionButtonWithHierarchy(): void {
        this.GetAllWithHierarchyCategoryId = !this.GetAllWithHierarchyCategoryId;
        this.DataGetAll();
    }
    onActionSelectorSelect(model: EstatePropertyCompanyModel | null): void {
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

    onActionButtonReload(): void {
        this.DataGetAll();
    }
    onActionCopied(): void {
        this.cmsToastrService.typeSuccessCopedToClipboard();
    }
    onSubmitOptionsSearch(model: any): void {
        this.filteModelContent.filters = model;
        this.DataGetAll();
    }

    expandedElement: any;




    onActionButtonLinkTo(
        model: EstatePropertyCompanyModel = this.tableRowSelected
    ): void {
        if (!model || !model.id || model.id.length === 0) {
            this.cmsToastrService.typeErrorSelectedRow();
            return;
        }
        if (model.recordStatus != RecordStatusEnum.Available) {
            this.cmsToastrService.typeWarningRecordStatusNoAvailable();
            return;
        }
        this.onActionTableRowSelect(model);


        const pName = this.constructor.name + "ServiceGetOneById";
        this.loading.Start(pName, this.translate.instant('MESSAGE.get_state_information'));
        this.contentService.setAccessDataType(ManageUserAccessDataTypesEnum.Editor);
        this.contentService
            .ServiceGetOneById(this.tableRowSelected.id)
            .subscribe({
                next: (ret) => {
                    if (ret.isSuccess) {
                        //open popup
                        var panelClass = '';
                        if (this.tokenHelper.isMobile)
                            panelClass = 'dialog-fullscreen';

                        else
                            panelClass = 'dialog-min';
                        const dialogRef = this.dialog.open(CmsLinkToComponent, {
                            height: "90%",
                            enterAnimationDuration: environment.cmsViewConfig.enterAnimationDuration,
                            exitAnimationDuration: environment.cmsViewConfig.exitAnimationDuration,
                            panelClass: panelClass,
                            data: {
                                title: ret.item.title,
                                urlViewContentQRCodeBase64: ret.item.urlViewContentQRCodeBase64,
                                urlViewContent: ret.item.urlViewContent,
                            },
                        });
                        dialogRef.afterClosed().subscribe((result) => {
                            if (result && result.dialogChangedDate) {
                                this.DataGetAll();
                            }
                        });
                        //open popup
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
}