import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreSiteModel, CoreSiteService, ErrorExceptionResult, TokenInfoModel } from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { PageInfoService } from 'src/app/core/services/page-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page-aboutus',
  templateUrl: './page-aboutus.component.html',
})
export class PageAboutusComponent implements OnInit {

  constructor(public pageInfo: PageInfoService,
    public translate: TranslateService,
    private tokenHelper: TokenHelper,
    private coreSiteService: CoreSiteService,
    private cmsToastrService: CmsToastrService,
  ) {

    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      if (this.tokenInfo.siteId > 0)
        this.SiteInfo(this.tokenInfo.siteId);
      else
      this.SiteInfo(0);
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      if (this.tokenInfo.siteId > 0)
        this.SiteInfo(this.tokenInfo.siteId);
      else
      this.SiteInfo(0);
    });

  }
  cmsApiStoreSubscribe: Subscription;
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreSiteModel> = new ErrorExceptionResult<CoreSiteModel>();
  loadDemoTheme=environment.loadDemoTheme;
  ngOnInit(): void {
    this.pageInfo.updateTitle(this.translate.instant('ACTION.ABOUT'));
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  SiteInfo(linkSiteId: number): void {
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreSiteService.ServiceMasterSiteInfo(linkSiteId).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.dataModelResult = ret;
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
