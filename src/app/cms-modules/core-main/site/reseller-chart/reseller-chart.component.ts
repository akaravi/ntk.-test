
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTreeNestedDataSource
} from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreEnumService, CoreSiteService, ErrorExceptionResult,
  FilterModel, RessellerChartModel
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';



@Component({
  selector: 'app-core-site-reseller-chart',
  templateUrl: './reseller-chart.component.html',
  styleUrls: ['./reseller-chart.component.scss'],
})
export class CoreSiteResellerChartComponent implements OnInit, OnDestroy {
  requestLinkSiteId = 0;
  constructor(
    private cmsToastrService: CmsToastrService,
    public coreEnumService: CoreEnumService,
    public categoryService: CoreSiteService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private tokenHelper: TokenHelper,
    public translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    this.translate.get('MESSAGE.Receiving_information').subscribe((str: string) => { this.loading.message = str; });
    this.requestLinkSiteId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkSiteId'));
  }

  dataModelSelect: RessellerChartModel = new RessellerChartModel();
  dataModelResult: ErrorExceptionResult<RessellerChartModel> = new ErrorExceptionResult<RessellerChartModel>();
  filterModel = new FilterModel();
  loading: ProgressSpinnerModel = new ProgressSpinnerModel();
  get optionLoading(): ProgressSpinnerModel {
    return this.loading;
  }
  @Input() set optionLoading(value: ProgressSpinnerModel) {
    this.loading = value;
  }
  treeControl = new NestedTreeControl<RessellerChartModel>(node => node.siteChilds);

  dataSource = new MatTreeNestedDataSource<RessellerChartModel>();
  @Output() optionChange = new EventEmitter<RessellerChartModel>();
  cmsApiStoreSubscribe: Subscription;
  @Input() optionReload = () => this.onActionReload();

  // hasChild = (_: number, node: RessellerChartModel) => false;
  hasChild(_: number, node: RessellerChartModel): boolean {
    if (node && node.siteChilds && node.siteChilds.length > 0) {
      return true;
    }
    // if (node && node.userChilds && node.userChilds.length > 0) {
    //   return true;
    // }
    return false;
  }

  ngOnInit(): void {
    this.DataGetAll();
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((value) => {
      this.DataGetAll();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.filterModel.rowPerPage = 200;
    this.filterModel.accessLoad = true;

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.categoryService.ServiceGetRessellerChart(this.requestLinkSiteId).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.dataModelResult = ret;
          this.dataSource.data = [this.dataModelResult.item];
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
  onActionSelect(model: RessellerChartModel): void {
    this.dataModelSelect = model;
    this.optionChange.emit(this.dataModelSelect);
  }
  onActionReload(): void {
    if (this.dataModelSelect) {
      this.onActionSelect(this.dataModelSelect);
    }
    else {
      this.onActionSelect(null);
    }
    this.dataModelSelect = new RessellerChartModel();
    this.DataGetAll();
  }


}
