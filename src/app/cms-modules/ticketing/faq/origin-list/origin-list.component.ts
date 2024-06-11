import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  DataFieldInfoModel, ErrorExceptionResult,
  FilterDataModel,
  FilterModel, SortTypeEnum, TicketingDepartemenModel, TicketingDepartemenService, TicketingFaqModel,
  TicketingFaqService, TokenInfoModel
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponent/base/componentOptionSearchModel';
import { ComponentOptionStatistModel } from 'src/app/core/cmsComponent/base/componentOptionStatistModel';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';

@Component({
  selector: 'app-ticketing-faq-originlist',
  templateUrl: './origin-list.component.html',
  styleUrls: ['./origin-list.component.scss']
})
export class TicketingFaqOriginListComponent implements OnInit, OnDestroy {
  constructor(
    private ticketingFaqService: TicketingFaqService,
    private ticketingDepartemenService: TicketingDepartemenService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public tokenHelper: TokenHelper,
  ) {
    this.loading.cdr = this.cdr; this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    /*filter Sort*/
    this.filteModelContent.sortColumn = 'Id';
    this.filteModelContent.sortType = SortTypeEnum.Ascending;
  }
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];

  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<TicketingFaqModel> = new ErrorExceptionResult<TicketingFaqModel>();
  dataDepartemenModelResult: ErrorExceptionResult<TicketingDepartemenModel> = new ErrorExceptionResult<TicketingDepartemenModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();

  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  loadingCat = new ProgressSpinnerModel();
  tableRowsSelected: Array<TicketingFaqModel> = [];
  tableRowSelected: TicketingFaqModel = new TicketingFaqModel();
  tableSource: MatTableDataSource<TicketingFaqModel> = new MatTableDataSource<TicketingFaqModel>();
  categoryModelSelected: TicketingDepartemenModel;

  cmsApiStoreSubscribe: Subscription;
  DataDepartemanLinkSelect = 0;
  DataFaqLinkSelect = 0;
  ngOnInit(): void {
    this.DataDepartemenGetAll();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      this.DataGetAll();
    });

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataDepartemenGetAll();
      this.tokenInfo = next;
      this.DataGetAll();
    });

  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }

  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.onActionTableRowSelect(new TicketingFaqModel());

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    this.filteModelContent.accessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    if (this.categoryModelSelected && this.categoryModelSelected.id > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkTicketingDepartemenId';
      filter.value = this.categoryModelSelected.id;
      filterModel.filters.push(filter);
    }

    this.ticketingFaqService.ServiceGetAllOrigin(filterModel).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.access);
        if (next.isSuccess) {
          this.dataModelResult = next;
          this.tableSource.data = next.listItems;
        }
        else {
          this.cmsToastrService.typeErrorGetAll(next.errorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  DataDepartemenGetAll(): void {
    this.loadingCat.Start('main');

    this.ticketingDepartemenService.ServiceGetAllOrigin(null).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.access);


        if (next.isSuccess) {
          this.dataDepartemenModelResult = next;
        }
        else {
          this.cmsToastrService.typeErrorGetAll(next.errorMessage);

        }
        this.loadingCat.Stop('main');
        this.cdr.detectChanges();
      },
      (error) => {
        this.cmsToastrService.typeError(error);

        this.loadingCat.Stop('main');
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


  onActionSelectorSelect(model: TicketingDepartemenModel | null): void {
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
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: TicketingFaqModel): void {
    this.tableRowSelected = row;
    if (!row["expanded"])
      row["expanded"] = false;
    row["expanded"] = !row["expanded"];
  }
  onActionBackToParent(): void {
    this.router.navigate(['/ticketing/departemen/']);
  }

  onActionButtonDeparteman(id: number): void {
    this.DataDepartemanLinkSelect = id;
    this.DataFaqLinkSelect = 0;
    //console.log('ID:' + id);
  }
  onActionButtonFaqTitle(id: number): void {
    this.DataFaqLinkSelect = id;
    //console.log('ID:' + id);
  }

}
